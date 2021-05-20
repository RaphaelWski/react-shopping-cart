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
import Coucou from './Coucou'

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
          {
            id: 2,
            name: 'Product C',
            description: 'Lorem ipsum dolor sit, amet consectetur',
            price: 10,
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

  updateCartPrice = (product: Product, qty: number) => {
    let { cart } = this.state
    let valueHT = product.price / (1 + (product.tax / 100)); // [Montant HT] = [Montant TTC] / (1 + ([Taux TVA] / 100))
    let value = product.price - valueHT;
    let tax: {name: number, value: number};
    
    const taxValue = cart.taxes.find(tax => tax.name == product.tax);
    // si taxValue et qty > 0 on ajoute un produit au panier donc on update
    // sinon si taxValue qty < 0 on verifie si on enleve le produit au panier (tax vide {})
    if(taxValue) {
      tax = { name: product.tax, value: taxValue.value + (qty * this.formatNumber(value)) };
    } else {
      // S'il reste une taxe du meme type mais que le calcul est <= 0, on enleve la tax
      // if((qty * this.formatNumber(value)) <= 0) {
      //   tax = {}
      // } else {
        tax = { name: product.tax, value: (qty * this.formatNumber(value)) };
      // }
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

      // si la taxe est deja existante, on additionne
      // sinon on la créee
      let tax = this.updateCartPrice(item, qty);
      let totalAmountIncludingTaxes = this.updateTotalAmount(item, qty);

      cart = {
        // ...cart,
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
        // ...cart,
        products: [
          ...cart.products.filter(product => product.productId !== item.id), // Attention à l'ordre
          cartProduct
        ],
        taxes: [
          ...cart.taxes,
          tax
        ],
        totalAmountIncludingTaxes: totalAmountIncludingTaxes
      }
    }
    // console.log(cart);
    
    this.setState({ cart })
  }

  removeFromCart = (item: Product, qty: number) => {
    let { cart } = this.state
    let cartProduct : CartProduct;

    const product = cart.products.find(product => product.productId === item.id)

    if(product && product.quantity) {
      if(product.quantity == 1) {
        // vérifier s'il y a deja ce type de tax
        // if() {

        // }
        let tax = this.updateCartPrice(item, qty); // si c'est le dernier taxName GESTION DeS TAXNAME
        let totalAmountIncludingTaxes = this.updateTotalAmount(item, qty);
        // let lastTaxType = cart.taxes.name
        // si tax <= 0 et que c'est la derniere de son type, on enleve cette tax
        if(tax.value <= 0) {
          console.log(`ON EST DANS  tax.value <= 0: ${tax.value}`);
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
    // console.log(cart);
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
    const { id, name, description } = item
    const media = <Avatar customer={true} size="large" name={name} />;
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
          this.removeFromCart(item, -1);
          // gérer le cas ou il n'y a rien dans le panier.
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
          this.handleChange
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
    
    /* Cart */
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
                <Coucou></Coucou>
                <List>
                  {cart.products.map(productCart => {
                    const product = data.products.find(product => product.id === productCart.productId)
                    if(product && product.price) {
                      return <List.Item key={product.id}>{product.name} : {productCart.quantity} × {product.price}€ <Button plain destructive onClick={ () => {this.removeFromCart(product, -1);}} >Remove</Button> </List.Item>
                    }
                  })}
                </List>
              </Card.Section>
              <Card.Section title="Totals">
                <List>
                  {
                  // Object.values(cart.taxes.reduce((prev: {[key: number]: [number, number]}, tax) => {

                  //     if(prev.hasOwnProperty(tax.name)) {
                  //       prev[tax.name] = [tax.name, prev[tax.name][1] + this.formatNumber(tax.value)]
                  //     } else {
                  //       prev[tax.name] = [tax.name, this.formatNumber(tax.value)]
                  //     }

                  //     return prev;
                  //     // /** TODO: Utilisation des props pour update le composant */
                  //   }, {} as {[key: number]: [number, number]})).map(([taxName, taxValue]: [number, number]) => <List.Item key={taxName}>TVA {taxName}% : {this.formatNumber(taxValue)}€</List.Item>)
                    
                    cart.taxes.map(tax => {
                      if(tax && tax.value) {
                        return <List.Item key={tax.name}>TVA {tax.name}% : {this.formatNumber(tax.value)}€</List.Item>
                      }
                      console.log(cart.taxes);
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
