import { Post } from "../../../shared/components/interfaces";

export const fakePosts: Post[] = [
    {
        id: 1,
        title: 'Test post 1',
        author: 'Peter',
        createAt: new Date('2025-01-01'),
        comments: [{ id: 1, text: 'Comment 1', author: 'Anna', createAt: new Date('2025-01-02') }],
        description: 'Description 1',
        imageUrl: 'https://example.com/image1.jpg',
        content: "Content 1",
        metaTitle: "Meta Title 1",
        metaDescription: "Meta Description 1",
        slug: "test-post-1"
    },
    {
        id: 2,
        title: 'Test post 2',
        author: 'Mike',
        createAt: new Date('2025-01-01'),
        comments: [{ id: 1, text: 'Comment 1', author: 'Anna', createAt: new Date('2025-01-02') }],
        description: 'Description 2',
        imageUrl: 'https://example.com/image2.jpg',
        content: "Content 2",
        metaTitle: "Meta Title 2",
        metaDescription: "Meta Description 2",
        slug: "test-post-2"
    },
    {
        id: 3,
        title: 'Test post 3',
        author: 'Jim',
        createAt: new Date('2025-01-01'),
        comments: [{ id: 1, text: 'Comment 1', author: 'Anna', createAt: new Date('2025-01-02') }],
        description: 'Description 3',
        imageUrl: 'https://example.com/image3.jpg',
        content: "Content 3",
        metaTitle: "Meta Title 3",
        metaDescription: "Meta Description 3",
        slug: "test-post-3"
    }
];