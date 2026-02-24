export default {
  fetch(request) {
    const url = new URL(request.url)

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
