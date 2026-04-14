/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase
   return sale_price * quantity * (1 - discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
     let bonus;

    if (index === 0) {
        bonus = profit * 0.15;
    } else if (index === 1 || index === 2) {
        bonus = profit * 0.1;
    } else if (index === total - 1) {
        bonus = 0;
    } else {
        bonus = profit * 0.05;
    }

    return Math.floor(bonus * 100) / 100;
}
    // методика расчетов бонусов
    
    
/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
      // @TODO: Проверка входных данных
    if (!data
        || !Array.isArray(data.sellers)
        || data.sellers.length === 0
        || !Array.isArray(data.products)
        || data.products.length === 0
        || !Array.isArray(data.purchase_records)
        || data.purchase_records.length === 0
    ) {
        throw new Error('Некорректные входные данные');
    }
    // @TODO: Проверка наличия опций
    if (!options || typeof options !== "object") {
        throw new Error('Некорректные опции');
    }

    const { calculateRevenue, calculateBonus } = options;

    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Не переданы функции расчёта');
    }
    if (typeof calculateRevenue !== "function" || typeof calculateBonus !== "function") {
        throw new Error('Опции должны быть функциями');
    }
    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));
    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(
    sellerStats.map(seller => [seller.id, seller])
    );
    const productIndex = Object.fromEntries (
        data.products.map(product => [product.sku, product])
    );
    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];

    // если вдруг продавца нет — пропускаем
        if (!seller) return;

    // 1. считаем количество продаж (чеков)
        seller.sales_count += 1;

    // 2. перебираем товары в чеке
        record.items.forEach(item => {
            const product = productIndex[item.sku];
            if (!product) return;

        // себестоимость
            const cost = product.purchase_price * item.quantity;

        // выручка (через функцию)
            const revenue = Number(calculateRevenue(item, product).toFixed(2));

        // прибыль
            const profit = revenue - cost;
        // накапливаем выручку по чеку
        seller.revenue += revenue;
        // накапливаем прибыль продавца
            seller.profit += profit;

        // учет проданных товаров
            if (!seller.products_sold[item.sku]) {
            seller.products_sold[item.sku] = 0;
            }

            seller.products_sold[item.sku] += item.quantity;
        });
    });
    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((a, b) => b.profit - a.profit);
    const total = sellerStats.length;
    // @TODO: Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, total, seller);

        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });
    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,

        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),

        sales_count: seller.sales_count,

        top_products: seller.top_products,

        bonus: +seller.bonus.toFixed(2)
}));
    }