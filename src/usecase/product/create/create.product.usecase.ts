import ProductFactory from '../../../domain/product/factory/product.factory'
import IProductRepository from '../../../domain/product/repository/product-repository.interface'
import {
  InputCreateProductDTO,
  OutputCreateProductDTO,
} from './create.product.dto'

export default class CreateProductUseCase {
  private readonly productRepository: IProductRepository

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository
  }

  async execute(input: InputCreateProductDTO): Promise<OutputCreateProductDTO> {
    const product = ProductFactory.create(input.type, input.name, input.price)

    await this.productRepository.create(product)

    return {
      id: product.id,
      name: product.name,
      price: product.price,
    }
  }
}
