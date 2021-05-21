import React, { Component, useEffect, useState } from 'react'
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
import { products } from './utils/data'
import { localCart } from './utils/localCart'

type Props = {}

type Product = {
  id: number,
  name: string,
  description: string,
  img_url: string
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
      data: products,
      cart: localCart
    }
  }

  componentDidMount() {
    const cartJson = localStorage.getItem('cart');
    const cart = cartJson !== null ? JSON.parse(cartJson) : this.state.cart;

    this.setState({cart})
  }

  componentDidUpdate() {
    const { cart } = this.state
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  updateCartPrice = (product: Product, qty: number) => {
    let { cart } = this.state
    // [Montant HT] = [Montant TTC] / (1 + ([Taux TVA] / 100))
    let valueHT = product.price / (1 + (product.tax / 100));
    let value = product.price - valueHT;
    let tax: {name: number, value: number};
    
    const taxValue = cart.taxes.find(tax => tax.name == product.tax);

    if(taxValue) {
      tax = { name: product.tax, value: taxValue.value + (qty * this.formatNumber(value)) };
    } else {
      tax = { name: product.tax, value: (qty * this.formatNumber(value)) };
    }
    
    return tax;
  }

  formatNumber(number: Number) {
    return parseFloat(Number.parseFloat(number.toString()).toFixed(2));
  }

  updateTotalAmount(item: Product, qty: number) {
    let { cart } = this.state;

    let total = cart.totalAmountIncludingTaxes + (qty * item.price);

    return total
  }

  addToCart = (item: Product, qty: number) => {
    let { cart } = this.state
    let cartProduct : CartProduct;

    const product = cart.products.find(product => product.productId === item.id)

    if(product && product.quantity) {
      cartProduct = { productId: item.id, quantity: product.quantity + qty }

      let tax = this.updateCartPrice(item, qty);
      let totalAmountIncludingTaxes = this.updateTotalAmount(item, qty);
      
      cart = {
        products: [
          ...cart.products.filter(product => product.productId !== item.id), // Attention à l'ordre
          cartProduct
        ],
        taxes: [
          ...cart.taxes.filter(tax => tax.name !== item.tax),
          tax
        ],
        totalAmountIncludingTaxes: totalAmountIncludingTaxes
      }
    } else {
      cartProduct = { productId: item.id, quantity: 1 }

      let tax = this.updateCartPrice(item, qty);
      let totalAmountIncludingTaxes = this.updateTotalAmount(item, qty);

      cart = {
        products: [
          ...cart.products.filter(product => product.productId !== item.id), // Attention à l'ordre
          cartProduct
        ],
        taxes: [
          ...cart.taxes.filter(tax => tax.name !== item.tax),
          tax
        ],
        totalAmountIncludingTaxes: totalAmountIncludingTaxes
      }
    }
    
    this.setState({ cart })
  }

  removeFromCart = (item: Product, qty: number) => {
    let { cart } = this.state
    let cartProduct : CartProduct;

    const product = cart.products.find(product => product.productId === item.id)

    if(product && product.quantity) {
      if(product.quantity == 1) {

        let tax = this.updateCartPrice(item, qty);
        let totalAmountIncludingTaxes = this.updateTotalAmount(item, qty);
        if(tax.value <= 0) {
          cart = {
            products: [
              ...cart.products.filter(product => product.productId !== item.id)  // Attention à l'ordre
            ],
            taxes: [
              ...cart.taxes.filter(tax => tax.name !== item.tax)
            ],
            totalAmountIncludingTaxes: totalAmountIncludingTaxes
          }
        } else {
          cart = {
            products: [
              ...cart.products.filter(product => product.productId !== item.id)  // Attention à l'ordre
            ],
            taxes: [
              ...cart.taxes.filter(tax => tax.name !== item.tax),
              tax
            ],
            totalAmountIncludingTaxes: totalAmountIncludingTaxes
          }
        }
      } else {
        cartProduct = { productId: item.id, quantity: product.quantity-1 }
        let tax =  this.updateCartPrice(item, qty);
        let totalAmountIncludingTaxes = this.updateTotalAmount(item, qty);
  
        cart = {
          ...cart,
          products: [
            ...cart.products.filter(product => product.productId !== item.id),  // Attention à l'ordre
            cartProduct
          ],
          taxes: [
            ...cart.taxes.filter(tax => tax.name !== item.tax),
            tax
          ],
          totalAmountIncludingTaxes: totalAmountIncludingTaxes
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

  checkoutCart = () => {
    console.log('Checkout Cart action');
  }

  handleChange = () => {
    const [count, setCount]= useState(0);

    useEffect(() => {
      document.title = `Vous avez cliqué ${count} fois`;
    });
    //  this.setState(this.state);
  }

  renderItem = (item: Product) => {
    const { id, name, description, img_url } = item
    const media = <Avatar customer={true} size="large" name={name} source={img_url} />;
    const shortcutActions = [
      {
        content: `Add`,
        onAction: () => {
          this.addToCart(item, 1);
        }
      },
      {
        content: `Remove`,
        onAction: () => {
          let isRemovable = this.state.cart.products.find(product => product.productId === item.id) == undefined ? false : true;
          // Cas où il n'y a rien dans le panier.
          if (isRemovable) this.removeFromCart(item, -1);
        }
      },
    ]
    return (
      // @ts-ignore
      <ResourceList.Item
        id={id.toString()}
        media={media}
        accessibilityLabel={`View details for ${name}`}
        shortcutActions={shortcutActions}
        persistActions={true}
        onClick={ () => {
          // console.log(item)
        }}
      >
        <h3>
          <TextStyle variation="strong">{name}</TextStyle>
        </h3>
        <div>{description}</div>
      </ResourceList.Item>
    )
  }

  render() {
    const { data, cart } = this.state
    
    const cancelCartAction =       {
      content: 'Cancel cart',
      onAction: () => this.cancelCart()
    }
    
    const checkoutCartAction = {
      content: 'Pay',
      onAction: () => this.checkoutCart()
    };
    
    return (
      <Page title="React Shopping Cart">
        <Layout>
          <Layout.Section>
            <Card>
              <ResourceList
                resourceName={{ singular: 'customer', plural: 'customers' }}
                items={data.products}
                renderItem={this.renderItem}
              />
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card
              title="Basket"
              secondaryFooterAction={cancelCartAction}
              primaryFooterAction={checkoutCartAction}
            >
              <Card.Section title="Items">
                <List>
                  {cart.products.map(productCart => {
                    const product = data.products.find(product => product.id === productCart.productId)
                    if(product && product.price) {
                      return <List.Item key={product.id}>{product.name} :<br/> {productCart.quantity} × {product.price}€ <Button plain destructive onClick={ () => {this.removeFromCart(product, -1);}} >Remove</Button> </List.Item>
                    }
                  })}
                </List>
              </Card.Section>
              <Card.Section title="Totals">
                <List>
                  {cart.taxes.map(tax => {
                      if(tax && tax.value) {
                        return <List.Item key={tax.name}>TVA {tax.name}% : {this.formatNumber(tax.value)}€</List.Item>
                      }
                    })
                    }
                  <List.Item>
                    {this.formatNumber(cart.totalAmountIncludingTaxes)}€ TTC
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
