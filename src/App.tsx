import React, { Component } from 'react'
import {
  Page,
  Layout,
  Card,
  ResourceList,
  List,
  Avatar,
  TextStyle,
  Button,
} from '@shopify/polaris'

type Props = {}

type Product = {
  id: number,
  name: string,
  description: string,
  price: number,
  tax: number,
}

type CartProduct = {
  productId: number,
  quantity: number,
}

type State = {
  data: {
    products: Product[],
  },
  cart: {
    products: CartProduct[],
    taxes: Array<{
      name: number,
      value: number,
    }>,
    totalAmountIncludingTaxes: number,
  },
}

export default class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      data: {
        products: [
          {
            id: 0,
            name: 'Product A',
            description: 'Lorem ipsum dolor sit, amet consectetur',
            price: 12,
            tax: 20,
          },
          {
            id: 1,
            name: 'Product B',
            description: 'Lorem ipsum dolor sit, amet consectetur',
            price: 13,
            tax: 5.5,
          },
        ],
      },
      cart: {
        products: [
          {
            productId: 0,
            quantity: 2,
          },
        ],
        taxes: [
          {
            name: 20,
            value: 4,
          },
        ],
        totalAmountIncludingTaxes: 24,
      },
    }
  }

  addToCart = (item: Product) => {
    let { cart } = this.state
    let cartProduct : CartProduct;

    const product = cart.products.find(product => product.productId === item.id)
    if(product && product.quantity) {
      cartProduct = { productId: item.id, quantity: product.quantity+1 }
      this.updateCartPrice(item);

      cart = {
        ...cart,
        products: [
          ...cart.products.filter(product => product.productId !== item.id), // Attention à l'ordre
          cartProduct
        ]
      }
    } else {
      cartProduct = { productId: item.id, quantity: 1 }
      this.updateCartPrice(item);

      cart = {
        ...cart,
        products: [
          ...cart.products,
          cartProduct
        ]
      }
    }
    
    this.setState({ cart })
  }

  updateCartPrice = (product: Product) => {
    let { cart }= this.state;

    // [Montant HT] = [Montant TTC] / (1 + ([Taux TVA] / 100))
    let valueHT = product.price / (1 + (product.tax / 100));
    let value = product.price - valueHT;
    let tax = { name: product.tax, value: this.formatNumber(value) };

    console.log(tax);

    let totalAmountIncludingTaxes = this.updateTotalAmount();
    console.log(totalAmountIncludingTaxes);

    cart = {
      ...cart,
      taxes: [
        ...cart.taxes,
        tax
      ],
      totalAmountIncludingTaxes: totalAmountIncludingTaxes
    }

    this.setState({ cart })
  }

  formatNumber(number: Number) {
    return parseFloat(Number.parseFloat(number.toString()).toFixed(2));
  }

  updateTotalAmount() {
    let { data, cart } = this.state;
    let total: number = 0;

    cart.products.map( productCart => {
      const productData = data.products.find(product => product.id === productCart.productId)
        if(productData && productData.price) {
          total += productCart.quantity * productData.price
        }
    });
    return total
  }

  removeFromCart = (item: Product) => {
    let { cart } = this.state
    let cartProduct : CartProduct;

    const product = cart.products.find(product => product.productId === item.id)
    if(product && product.quantity) {
      if(product.quantity == 1) {
        cart = {
          ...cart,
          products: [
            ...cart.products.filter(product => product.productId !== item.id),  // Attention à l'ordre
          ]
        }
      } else {
          cartProduct = { productId: item.id, quantity: product.quantity-1 }
          this.updateCartPrice(item);
    
          cart = {
            ...cart,
            products: [
              ...cart.products.filter(product => product.productId !== item.id), // Attention à l'ordre
              cartProduct
            ]
          }
        }
      }    
    this.setState({ cart })
  }
  
  cancelCart = () => {
    let { cart } = this.state;

    cart = {
      ...cart,
      products: [],
      taxes: [],
      totalAmountIncludingTaxes: 0
    }

    this.setState({ cart });
  }

  handleChange = () => {
    this.setState(this.state);
  }

  render() {
    const { data, cart } = this.state
    return (
      <Page title="React Shopping Cart">
        <Layout>
          <Layout.Section>
            <Card>
              <ResourceList
                resourceName={{ singular: 'customer', plural: 'customers' }}
                items={data.products}
                renderItem={item => {
                  const { id, name, description } = item
                  const media = (
                    <Avatar customer={true} size="medium" name={name} />
                  )
                  const shortcutActions = [
                    {
                      content: `Add ${item.name}`,
                      onAction: () => {
                        this.addToCart(item);
                      }
                    },
                  ]
                  return (
                    // @ts-ignore
                    <ResourceList.Item
                      id={id}
                      media={media}
                      accessibilityLabel={`View details for ${name}`}
                      shortcutActions={shortcutActions}
                      persistActions={true}
                      onClick={ () => {
                        console.log(item)
                        this.handleChange
                      }}
                    >
                      <h3>
                        <TextStyle variation="strong">{name}</TextStyle>
                      </h3>
                      <div>{description}</div>
                    </ResourceList.Item>
                  )
                }}
              />
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card
              title="Basket"
              secondaryFooterAction={{ content: 'Cancel cart', onAction: () => { this.cancelCart();}, }}
              primaryFooterAction={{ content: 'Pay', }}
            >
              <Card.Section title="Items">
                <List>
                  {cart.products.map(productCart => {
                    const product = data.products.find(product => product.id === productCart.productId)
                    if(product && product.price) {
                      return <List.Item>{product.name} : {productCart.quantity} × {product.price}€ <Button plain destructive onClick={ () => {this.removeFromCart(product);}} >Remove</Button> </List.Item>
                    }
                  })}
                </List>
              </Card.Section>
              <Card.Section title="Totals">
                <List>
                  {cart.taxes.map(tax => (
                    <List.Item>
                      TVA {tax.name}% : {tax.value.toFixed(2)}€
                    </List.Item>
                  ))}
                  <List.Item>
                    {cart.totalAmountIncludingTaxes.toFixed(2)}€ TTC
                  </List.Item>
                </List>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    )
  }
}
