import Order from '../../domain/entity/order'
import OrderItem from '../../domain/entity/order_item'
import OrderRepositoryInterface from '../../domain/repository/order-repository.interface'
import OrderItemModel from '../db/sequelize/model/order-item.model'
import OrderModel from '../db/sequelize/model/order.model'

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          product_id: item.productId,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      },
    )
  }

  async update(entity: Order): Promise<void> {
    const sequelize = OrderModel.sequelize
    await sequelize.transaction(async (t) => {
      await OrderItemModel.destroy({
        where: { order_id: entity.id },
        transaction: t,
      })

      const items = entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      }))

      await OrderItemModel.bulkCreate(items, { transaction: t })

      await OrderModel.update(
        { total: entity.total() },
        { where: { id: entity.id }, transaction: t },
      )
    })
  }

  async findById(id: string): Promise<Order> {
    let orderModel
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
      })
    } catch (error) {
      throw new Error('Customer not found')
    }

    const items: OrderItem[] = orderModel.items.map(
      (item) =>
        new OrderItem(
          item.id,
          item.name,
          item.price,
          item.quantity,
          item.product_id,
        ),
    )

    const order = new Order(orderModel.id, orderModel.customer_id, items)

    return order
  }

  async findAll(): Promise<Order[]> {
    throw new Error('No Implement')
  }
}
