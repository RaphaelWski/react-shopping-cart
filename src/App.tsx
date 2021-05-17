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

enum TaxRate {
  Twenty = 20,
  Ten = 10,
  Five = 5.5,
  Two = 2.1,
  Nineteen = 19.6,
  Seven = 7
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

  addToCart = (item: Product) => {
    let { cart } = this.state
    let cartProduct : CartProduct;

    const product = cart.products.find(product => product.productId === item.id)
    if(product && product.quantity) {
      cartProduct = { productId: item.id, quantity: product.quantity+1 }
      // this.updateCartPrice(item); /** ne mets pas à jour le state */

      /** START */
      // [Montant HT] = [Montant TTC] / (1 + ([Taux TVA] / 100))
      let valueHT = item.price / (1 + (item.tax / 100));
      let value = item.price - valueHT;
      let tax = { name: item.tax, value: this.formatNumber(value) };
      console.log(tax);
      let totalAmountIncludingTaxes = this.updateTotalAmount();
      console.log(totalAmountIncludingTaxes);
      /** END */

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
    } else {
      cartProduct = { productId: item.id, quantity: 1 }
      // this.updateCartPrice(item); /** ne mets pas à jour le state */

      /** START */
      // [Montant HT] = [Montant TTC] / (1 + ([Taux TVA] / 100))
      let valueHT = item.price / (1 + (item.tax / 100));
      let value = item.price - valueHT;
      let tax = { name: item.tax, value: this.formatNumber(value) };
      console.log(tax);
      let totalAmountIncludingTaxes = this.updateTotalAmount();
      console.log(totalAmountIncludingTaxes);
      /** END */

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
    
    this.setState({ cart })
  }

  removeFromCart = (item: Product) => {
    let { cart } = this.state
    let cartProduct : CartProduct;

    const product = cart.products.find(product => product.productId === item.id)
    if(product && product.quantity) {
      if(product.quantity == 1) {
        /** START */
        // [Montant HT] = [Montant TTC] / (1 + ([Taux TVA] / 100))
        let valueHT = item.price / (1 + (item.tax / 100));
        let value = item.price - valueHT;
        let tax = { name: item.tax, value: this.formatNumber(value) };
        console.log(tax);
        // let totalAmountIncludingTaxes = this.updateTotalAmount();
        let totalAmountIncludingTaxes: number = 0;
          /** START */
          let { data } = this.state;
          cart.products.map( productCart => {
            const productData = data.products.find(product => product.id === productCart.productId)
            if(productData && productData.price) {
              totalAmountIncludingTaxes += productCart.quantity * productData.price
            }
          });
          /** END */
        console.log(totalAmountIncludingTaxes);
        console.log(typeof cart);
        /** END */

        cart = {
          products: [
            ...cart.products.filter(product => product.productId !== item.id)  // Attention à l'ordre
          ],
          taxes: [
            ...cart.taxes,
            tax
          ],
          totalAmountIncludingTaxes: totalAmountIncludingTaxes
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

  checkoutCart = () => {
    console.log('Checkout Cart action');
  }

  handleChange = () => {
    this.setState(this.state);
  }

  renderItem = (item: Product) => {
    const { id, name, description } = item
    const media = <Avatar customer={true} size="large" name={name} />;
    const shortcutActions = [
      {
        content: `Add`,
        onAction: () => {
          this.addToCart(item);
        }
      },
      {
        content: `Remove`,
        onAction: () => {
          this.removeFromCart(item);
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
          // Gestion du panier (changement du state et calcul du total)
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
                  {cart.taxes.map(tax => {
                      let sumTwenty, sumTen, sumFive, sumTwo, sumNineteen, sumSeven;
                      if(tax.name == TaxRate.Twenty) sumTwenty = cart.taxes.reduce((total, tax) => this.formatNumber(tax.value) + total,0)
                      if(tax.name == TaxRate.Ten) sumTen = cart.taxes.reduce((total, tax) => this.formatNumber(tax.value) + total,0)
                      if(tax.name == TaxRate.Five) sumFive = cart.taxes.reduce((total, tax) => this.formatNumber(tax.value) + total,0)
                      if(tax.name == TaxRate.Two) sumTwo = cart.taxes.reduce((total, tax) => this.formatNumber(tax.value) + total,0)
                      if(tax.name == TaxRate.Nineteen) sumNineteen =cart.taxes.reduce((total, tax) => this.formatNumber(tax.value) + total,0)
                      if(tax.name == TaxRate.Seven) sumSeven = cart.taxes.reduce((total, tax) => this.formatNumber(tax.value) + total,0)

                      // if(sumTwenty) return <List.Item>TVA {TaxRate.Twenty}% : {this.formatNumber(sumTwenty)}€</List.Item>
                      // if(sumTen) return <List.Item>TVA {TaxRate.Ten}% : {this.formatNumber(sumTen)}€</List.Item>
                      // if(sumFive) return <List.Item>TVA {TaxRate.Five}% : {this.formatNumber(sumFive)}€</List.Item>
                      // if(sumTwo) return <List.Item>TVA {TaxRate.Two}% : {this.formatNumber(sumTwo)}€</List.Item>
                      // if(sumNineteen) return <List.Item>TVA {TaxRate.Nineteen}% : {this.formatNumber(sumNineteen)}€</List.Item>
                      // if(sumSeven) return <List.Item>TVA {TaxRate.Seven}% : {this.formatNumber(sumSeven)}€</List.Item>

                      /** TODO: Utilisation des props pour update le composant */
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
