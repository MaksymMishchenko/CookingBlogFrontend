export const PAGING_TEST_CASES = [
    // 1. Сценарій: Мало сторінок (total <= MAX_PAGES_TO_SHOW)
    {
        description: 'Should show all pages when total count is low (No ellipsis)',
        totalPosts: 40, // totalPages = 4
        currentPage: 2,
        expected: [1, 2, 3, 4]
    },

    // 2. Сценарій: Початок діапазону (Немає лівої багатокрапки)
    {
        description: 'Should omit left ellipsis when currentPage is near the start (e.g., page 3/10)',
        totalPosts: 100, // totalPages = 10
        currentPage: 3,
        expected: [1, 2, 3, 4, 5, '...', 10]
    },

    // 3. Крайній випадок: Активна перша сторінка
    {
        description: 'Should handle currentPage=1 correctly (show start range and right ellipsis)',
        totalPosts: 100, // totalPages = 10
        currentPage: 1,
        expected: [1, 2, 3, 4, 5, '...', 10]
    },

    // 4. Сценарій: Середина діапазону (Обидві багатокрапки присутні)
    {
        description: 'Should show both ellipses when currentPage is in the middle range (e.g., page 5/10)',
        totalPosts: 100, // totalPages = 10
        currentPage: 5,
        expected: [1, '...', 3, 4, 5, 6, 7, '...', 10]
    },

    // 5. Сценарій: Кінець діапазону (Немає правої багатокрапки)
    {
        description: 'Should omit the right ellipsis when currentPage is near the end (e.g., page 8/10)',
        totalPosts: 100, // totalPages = 10
        currentPage: 8,
        expected: [1, '...', 6, 7, 8, 9, 10]
    },

    // 6. Крайній випадок: Активна остання сторінка
    {
        description: 'Should handle currentPage=totalPages correctly (show left ellipsis and end range)',
        totalPosts: 100, // totalPages = 10
        currentPage: 10,
        expected: [1, '...', 6, 7, 8, 9, 10]
    },

    // 7. Крайній випадок: 1 сторінка (повинно повернути [1] або нічого, залежно від шаблону)
    // Геттер поверне [1], але шаблон, ймовірно, не відобразить
    {
        description: 'Should return [1] for only one page',
        totalPosts: 10, // totalPages = 1
        currentPage: 1,
        expected: [1]
    },
];