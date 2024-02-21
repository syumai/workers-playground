import { Hono } from 'hono'
import { renderer } from './renderer'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

const createPostSchema = z.object({
  title: z.string(),
  body: z.string(),
})

app.post('/posts', zValidator('form', createPostSchema), async (c) => {
  const { title, body } = c.req.valid('form')
  const stmt = c.env.DB.prepare('INSERT INTO posts (title, body) VALUES (?, ?)').bind(title, body)
  await stmt.run()
  return c.redirect('/posts')
})

type Post = {
  title: string
  body: string
}

const PostForm = () => (
  <form method='post' action='/posts'>
    <input name='title' placeholder='title' />
    <input name='body' placeholder='body' />
    <button>Post</button>
  </form>
)

const PostsList = ({ posts }: { posts: Post[] }) => (
  <div>
    {posts.map((post) => (
      <div>
        <div>Title: {post.title}</div>
        <div>Body: {post.body}</div>
        <hr />
      </div>
    ))}
  </div>
)

app.get('/posts', async (c) => {
  const posts = await c.env.DB.prepare('SELECT * FROM posts').all()
  return c.render(
    <div>
      <PostForm />
      <PostsList posts={posts.results as Post[]} />
    </div>
  )
})

export default app
