/** 供 Chat transport 读取当前 composer 文档范围（避免在 transport 闭包中挂 React context）。 */
export const composerDocumentScopeRef = { current: [] as string[] }
