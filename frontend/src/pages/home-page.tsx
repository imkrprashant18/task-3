import { useEffect } from "react"
import Home from "../components/home"
import { useBlogStore } from "../store/get-public-blogs"


const HomePage = () => {
        const { fetchBlogs, blogs } = useBlogStore()
        useEffect(() => {
                if (!blogs || blogs.length === 0) {
                        fetchBlogs()
                }
        }, [blogs, fetchBlogs])
        console.log(blogs)
        return (

                <>
                        <Home />
                </>
        )
}

export default HomePage