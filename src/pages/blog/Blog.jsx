import React, { useEffect, useState } from 'react'
import VideoPlayer from '../../components/videoPlayer/VideoPlayer'
import { blogService } from '../../services/blog/blogService.js';

function Blog() {
    const [loading, setLoading] = useState(false);
    const [blog, setBlog] = useState([]);

    const getBlogData = async () => {
        try {
            setLoading(true)
            const blogArray = await blogService.getBlogs();
            setBlog(blogArray);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getBlogData();
    }, [])

    return (
        <div className="bg-bg-base min-h-screen">
            {loading && <div className="text-center p-6 text-text-muted">Loading videos...</div>}
            <div className="flex flex-wrap -mx-4 p-6">
                {blog && blog.map((data, index) => (
                    <VideoPlayer key={index} videoId={data.YTVideoId} />
                ))}
            </div>
        </div>
    )
}

export default Blog
