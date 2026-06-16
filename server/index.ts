export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // 统一处理 CORS 预检请求（方便 Web 前端调用）
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, X-App-Token',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // --- 新增：DeepSeek 代理 ---
    if (url.pathname.startsWith('/deepseek/')) {
      // 1. 验证应用令牌（可选但强烈推荐）
      const appToken = request.headers.get('X-App-Token')
      if (!appToken || appToken !== env.API_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      // 2. 构造目标 URL：去掉 /deepseek 前缀，拼接真实 API 地址
      const deepseekPath = url.pathname.replace(/^\/deepseek/, '')
      const deepseekUrl = `https://api.deepseek.com${deepseekPath}${url.search}`

      // 3. 复制并修改请求头
      const headers = new Headers(request.headers)
      headers.set('Authorization', `Bearer ${env.DEEPSEEK_API_KEY}`)
      headers.delete('Host') // 避免泄露 Worker 域名
      headers.delete('X-App-Token') // 不转发内部令牌

      const modifiedRequest = new Request(deepseekUrl, {
        method: request.method,
        headers,
        body: request.body,
        redirect: 'follow',
      })

      // 4. 转发并附加 CORS 头（支持流式响应）
      const response = await fetch(modifiedRequest)
      const newResponse = new Response(response.body, response)
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      return newResponse
    }

    // --- 以下是原有路由，保持不变 ---
    if (url.pathname.startsWith('/api/')) {
      return Response.json({
        name: 'Cloudflare',
      })
    } else if (url.pathname === '/ai') {
      return fetch(
        'https://api.cloudflare.com/client/v4/accounts/b666bcb97b0bdc3983313c378229ce79/ai/run/@cf/openai/gpt-oss-120b',
        {
          method: request.method,
          headers: request.headers,
          body: request.body,
        },
      )
    }

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
