# 单会话多文档 - 技术实现注意事项

---

## 🎯 核心变化

| 维度 | 单文档 | 多文档 |
|------|--------|--------|
| **数据模型** | Chunk → Document | Chunk → Document → Conversation |
| **检索范围** | 单个文档内检索 | N 个文档内跨文档检索 |
| **引用展示** | 只有页码 | 需要显示：【文档A · 第5页】 |
| **Prompt 构建** | 仅来自一个文档 | 来自多个文档，需要标注来源 |

---

## 🔴 一级风险：必须处理

### 1. 跨文档混淆问题

**问题描述**：
> 用户问："A 文档的价格和 B 文档的价格有什么区别？"
>
> LLM 很容易把两个文档的信息搞混，张冠李戴。

**解决方案**：
```
每个 chunk 在塞给 Prompt 时，必须在最前面标注来源：

【文档名：产品需求v2.pdf · 第 12 页】
价格：标准版 99 元，企业版 299 元

【文档名：产品需求v1.pdf · 第 8 页】
价格：标准版 199 元，无企业版
```

✅ Prompt 工程化，强制每个 chunk 携带文档元数据

---

### 2. Token 爆炸问题

**问题描述**：
> 每个文档 50 页 = 100 个 chunk
> 5 个文档 = 500 个 chunk
> Top 20 召回 = 约 10k tokens

已经超过 GPT-3.5 的 16k 窗口一半了，再加上对话历史很容易爆。

**解决方案**：

| 方案 | 效果 | 复杂度 |
|------|--------|---------|
| 限制会话内最多文档数 | MVP 限制最多 3 个文档 | 低 ✅ |
| 减少 Top K 召回数量 | 从 20 降到 10 | 低 ✅ |
| 每个 chunk 增加摘要字段 | 检索后用摘要代替原文 | 中 |
| Rerank 重排序 | 用 Cohere Rerank 精选前 5 个 | 高 |

✅ MVP 策略：对话内最多同时选 3 个文档。

---

### 3. 引用溯源的歧义

**问题描述**：
> 原来：【第 5 页】
> 现在：两个文档都有第 5 页，跳哪个？

**解决方案**：

数据库 Chunk 表必须加冗余字段：

```prisma
model Chunk {
  // 原有字段
  documentId   String
  documentName String  // ✅ 冗余，避免联表查
  pageNum      Int
  
  // 引用显示时：【产品需求.pdf · 第 5 页】
}
```

✅ 设计时就要冗余，不要到时候 JOIN 爆炸。

---

## 🟡 二级风险：重点关注

### 4. 检索准确率下降

**表现**：
> A 文档的相关度 0.85，B 文档的相关度 0.84
> 结果 Top 10 全被 A 文档占满了，B 文档一个都没出来。

**解决方案**：

```sql
-- 不能只按相似度排序
-- 要做每个文档的"代表名额分配"

WITH ranked_chunks AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (PARTITION BY document_id ORDER BY distance) as doc_rank
  FROM chunks
  WHERE document_id IN ('doc1', 'doc2', 'doc3')
  ORDER BY distance
  LIMIT 30
)
SELECT * FROM ranked_chunks 
WHERE doc_rank <= 3  -- 每个文档最多贡献 3 个 chunk
ORDER BY distance
LIMIT 10
```

✅ 保证每个选中的文档都有"曝光机会"。

---

### 5. 会话上下文管理

**场景变化**：

| 原单文档流程 | 多文档新流程 |
|-------------|-------------|
| 点文档 → 开始聊 | 1. 创建会话<br>2. 往会话里"添加"N个文档<br>3. 基于已选文档聊天<br>4. 中途可以再加文档 |

**新增状态**：
- 会话有自己的独立 id
- 会话和文档是多对多关系
- 文档可以属于多个会话

**数据模型变更**：
```prisma
model Conversation {
  id        String   @id @default(uuid())
  name      String?
  userId    String
  createdAt DateTime @default(now())
  
  // 多对多
  documents Document[] @relation("ConversationDocuments")
  messages  Message[]
}

model Document {
  // ... 原有字段
  conversations Conversation[] @relation("ConversationDocuments")
}
```

---

### 6. 增量添加文档

**用户场景**：聊到一半，发现缺了个文档，中途加一个。

**技术注意点**：
- 加文档不影响已有历史消息
- 加完文档不需要刷新页面
- 新加的文档后面的提问才生效，之前的回答不回溯

---

## 🟢 三级优化：提升体验

### 7. 文档选择器组件

UI 新增：
- 会话顶部显示"已选择 3 个文档"
- 点击可打开文档选择弹窗
- 可以勾选 / 取消勾选文档
- 实时生效

### 8. 来源分组展示

AI 回答的引用按文档分组：

```
📄 产品需求v2.pdf 中的引用：
  • 第 5 页：关于价格
  • 第 12 页：关于功能

📄 产品需求v1.pdf 中的引用：
  • 第 8 页：关于价格
```

不要混在一起列 10 个引用，用户不知道哪个来自哪个文档。

---

## 📊 数据库 Schema 变更总结

```prisma
// ✅ 新增：会话表
model Conversation {
  id        String   @id @default(uuid())
  name      String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  documents Document[] @relation("ConversationDocuments")
  messages  Message[]
}

// ✅ 修改：Chunk 表增加冗余
model Chunk {
  // ... 原有字段
  documentName String  // 冗余字段！
}

// ✅ 新增：消息表（原来可能没有）
model Message {
  id              String   @id @default(uuid())
  conversationId  String
  role            String   // user / assistant
  content         String
  citations       Json?    // 这轮回答用到的引用
  createdAt       DateTime @default(now())
}
```

---

## ✅ MVP 降级方案建议

| 功能 | 完全体 | MVP 降级版 |
|------|--------|-----------|
| 最大文档数 | 无限制 | 最多 3 个 |
| 中途加文档 | ✓ | ❌ 创建会话时选好，之后不能改 |
| 多会话历史 | ✓ | ❌ 单会话 + 多文档 |
| 按文档分组引用 | ✓ | ❌ 直接标 【文档A · P5】 |
| 跨文档名额分配 | ✓ | ❌ 纯相似度排序 |

---

## 🚩 关键决策点

1. **要不要现在就做多文档？**
   - 要：产品体验飞跃
   - 不要：单文档先跑通，少踩很多坑

2. **数据库要不要上 Conversation 表？**
   - 要：现在就做，后面改数据模型代价大
   - 不要：前期用 selectedDocumentIds 存在前端，不存后端

3. **Chunk 冗余不冗余？**
   - ✅ **100% 冗余**，这个毫无争议

---

> **总结**：
> 单文档到多文档，看起来只是加了个多选框，
> 实际上是整个数据模型、检索策略、Prompt 模板的全面升级。
>
> 建议：先跑通单文档完整链路，再加多文档能力！
