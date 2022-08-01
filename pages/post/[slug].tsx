import { GetStaticProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import Header from './../../components/Header';
import PortableText from 'react-portable-text'
import {useForm, SubmitHandler} from 'react-hook-form'

interface Props{
    post: Post
}

interface IFormInput{
    _id: string;
    name: string;
    email: string;
    comment: string;
}

function Post({post}: Props) {

    const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>()

    const onSubmit: SubmitHandler<IFormInput> = async (data)=>{
       await fetch('/api/createComment',{
        method: 'Post',
        body: JSON.stringify(data)
       }).then(()=>{
        alert("Comment added successfully.")
        console.log(data)
       }).catch(err=>{
        console.error(err)
       })
    }

  return (
    <main>
        <Header />

        <img 
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()!} alt="" />

        <article className='max-w-3xl mx-auto p-3'>
            <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
            
            <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>

            <div className='flex items-center space-x-2'>
                <img className='h-10 w-10 rounded-full'
                src={urlFor(post.author.image).url()!} alt="" />
                <p className='font-extralight text-sm'>
                    Blog post by <span className='text-green-600'>{post.author.name} </span>- published at
                    {new Date(post._createdAt).toLocaleString()}
                </p>
            </div>

            <div className='mt-4'>
                <PortableText 
                    dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
                    projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
                    content={post.body}
                    serializers={
                        {
                            h1: (props:any)=>(
                                <h1 className='text-2xl font-bold my-5' {...props}/>
                            
                            ),
                            link:({href, children}:any) =>(
                                <a href={href} className="text-blue-500 hover-underline">
                                    {children}
                                </a>
                            )
                        }
                    }
                />
            </div>
            
        </article>

        <hr className="max-w-lg my-5 mx-auto border border-yellow-4" />

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 max-w-2xl mx-auto mb-10'>
            <input {...register("_id")} type="hidden"  name="_id" value={post._id}/>
            <label className="black mb-5">
                <span className="text-gray-700">Name</span>
                <input  {...register("name",{required: true})}  className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500" type="text" placeholder='name'/>
            </label>
            <label className="black mb-5">
                <span className="text-gray-700">Email</span>
                <input {...register("email",{required: true})} className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500" type="email" placeholder='email'/>
            </label>
            
            <label className="black mb-5">
                <span className="text-gray-700">Comment</span>
                <textarea {...register("comment",{required: true})} className="shadow border rounded py-2 px-3 from-textarea mt-1 block w-full ring-yellow-500 outline-none foucs:ring" rows={8}/>
            </label>

            <div className='flex flex-col p-5'>
                {errors.name && <span className="text-red-500">Name is required</span>}
                {errors.email && <span className="text-red-500">Email is required</span>}
                {errors.comment && <span className="text-red-500">Comment is required</span>}
            </div>
            
            <input type="submit" className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer'/>
        </form>
    </main>
  )
}

export default Post

export const getStaticPaths = async ()=>{
    const query = `*[_type == "post"]{
        _id,
        slug{
        current
      }
      }`
    
      const posts = await sanityClient.fetch(query);
      const paths = posts.map((post:Post) =>{
        return {
            params: {
                slug: post.slug.current
            }
        }
      })

      return {
        paths,
        fallback: 'blocking'
      }
}

export const getStaticProps: GetStaticProps = async ({params})=>{
    const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
        createdAt,
        title,
        author->{
         name, 
         image
         },
       'comments': *[
         _type=="comment" &&
         post._ref == ^._id &&
         approved ==true],
      description,
      mainImage,
      slug, 
      body
      }`
    
      const post = await sanityClient.fetch(query,{
        slug: params?.slug
      });

      if(!post){
        return {
            notFound: true
        }
      }

      return {
        props:{
            post
        },
        revalidate: 60
      }
}