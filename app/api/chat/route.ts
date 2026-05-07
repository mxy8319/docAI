export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const lastMessage = messages[messages.length - 1];
  
  const responses = [
    "这是一个很好的问题！让我为你分析一下。",
    "根据我的知识，我可以提供以下信息：",
    "感谢你的提问！以下是我的回答：",
    "好的，我来帮你解答这个问题。",
    "这个话题很有趣，让我详细解释一下。",
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const content = `${randomResponse}\n\n你问的是："${lastMessage?.content || '未指定内容'}"\n\n这是一个模拟的AI回复。在实际应用中，这里会调用真实的AI模型来生成回答。`;

  return new Response(JSON.stringify({ content }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}