export interface Post {
    postId?: number
    title: string
    description: string
    content: string
    author: string
    createAt: Date
    imageUrl: string
    metaTitle: string
    metaDescription: string
    slug: string
}

export interface User{
    username: string,
    password: string
}

export interface ApiServiceAuthResponse{
    token: string,
    expires: string
}