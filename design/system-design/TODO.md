1.文档解析： 
  上传文档进行
  解析与页码进行绑定
  分块 
  向量化（vector）： OpenAI Embedding： 找相近的意思， 将每个chunk 转换为向量
  向量存入向量库： pgvector， 
  PostgreSQL： 
    结构化数据，保存用户数据，权限，mvp， 
    文档元数据， 文档chunk来源信息
  chat bot， 小型文档问答

  用户提问的问题，转换成向量， 检索向量库中相似的chunk， 塞给LLMN 

  文档本体： Supabase Storage

  text-embedding-3-small/large

2. 登录注册， 微信扫码登录-微信开发者， 有免费额度

Q：
1. 大文档的解析： 1000页以上，内存控制，队列，分批处理，
2. 智能语义分块；
3. prompt约束 ：prompt工程化， 
   1. 引用校验：对来源进行校验，答案与原文相关， 错误的引用



rag的流程： 用户提问，检索chunks， 由LLMN 生成回答， 生成引用source ，再进行校验（verify）， 返回答案和引用


引用溯源 
  chunk 和原文的页码， 及坐标 是有绑定关系的

模型选择： text-embedding-3-small/large  或者 openai的通用模型，



大文档： 异步任务队列， worker解析，任务状态。


min： 
  注册登录，上传文档（拒绝大文档），上传解析进度条，上传成功预览，
  左侧文档预览：   
  右侧对话框：  https://www.assistant-ui.com/，需要有摘要，引用来源展示，用户点击溯源， 左侧文档预览跳转到引用来源的页码
  