import type { LoaderArgs } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { Links, Meta, Scripts, useCatch, useLoaderData } from '@remix-run/react'

interface Wedding {
  id: string
  title: string
  streamId: string
}
interface Data extends Wedding {
  streamCustomerId: string
}

export const loader = async ({ context, params }: LoaderArgs) => {
  // @ts-ignore This is supposed to work..
  const wedding = await context.WEDDING.get<Wedding>(params.watchId, {
    type: 'json',
  })
  if (!wedding) throw new Response('Not Found', { status: 404, statusText: 'Wedding not found' })

  const streamCustomerId = context.STREAM_CUSTOMER_ID
  if (!streamCustomerId) throw new Response('Not Found', { status: 500, statusText: 'internal error' })

  return json<Data>({
    streamCustomerId,
    ...wedding,
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  if (!data) throw new Response('Not Found', { status: 404 })
  const streamUrl = `https://customer-${data.streamCustomerId}.cloudflarestream.com/${data.streamId}/iframe?preload=true&autoplay=true`
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
        {data.title}
      </h1>
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <iframe
          title="LiveStream"
          src={streamUrl}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
          id="stream-player"
        ></iframe>
      </div>
      <script src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>
      <br></br>
      <div className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3" role="alert">
        <p className="font-bold">Stream not working?</p>
        <p className="text-sm">
          If the stream does not start playing automatically, <b>try refreshing the page.</b>
        </p>
      </div>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1>
            Error: {caught.status} {caught.statusText}
          </h1>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
