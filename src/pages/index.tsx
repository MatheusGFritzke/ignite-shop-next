import Image from "next/image";
import { HomeContainer, Product } from "../styles/pages/home";
import Head from "next/head";
import { useKeenSlider } from 'keen-slider/react'

import Link from 'next/link'

import 'keen-slider/keen-slider.min.css'

import { stripe } from "../lib/stripe";
import { GetStaticProps } from "next";
import Stripe from "stripe";

interface HomeProps {
  products: Product[]
}

interface Product {
  id: string
  name: string
  imageUrl: string
  price: string
  currency: string
}

export default function Home({ products }: HomeProps) {

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  })

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>
      
      <HomeContainer ref={sliderRef} className='keen-slider'>
        {products.map(product => {
          return (
            <Link
              prefetch={false}
              href={`/product/${product.id}`}
              key={product.id}>
              <Product className='keen-slider__slide'>
                <Image src={product.imageUrl} alt="" width={520} height={480} />

                <footer>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          )
        })}
      </HomeContainer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  })

  const products = response.data.map(product => {

    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: (price.unit_amount! / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      currency: price.currency,
    }
  })

  return {
    props: {
      products
    },
    revalidate: 60 * 60 * 2, // 2 hours
  }
}