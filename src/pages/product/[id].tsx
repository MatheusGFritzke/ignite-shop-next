import { stripe } from "@/src/lib/stripe";
import { ImageContainer, ProductContainer, ProductDetails } from "@/src/styles/pages/products";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import Stripe from "stripe";

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    currency: string
    description: string
  }
}

export default function Product({ product }: ProductProps) {
  const { query } = useRouter()

  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={product!.imageUrl} width={520} height={480} alt="" />
      </ImageContainer>

      <ProductDetails>
        <h1>{product!.name}</h1>
        <span>{product!.price}</span>

        <p>{product!.description}</p>

        <button>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_PtYm7wjK01HKS6'} } // Product ID
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params.id

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  });

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: (price.unit_amount! / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        currency: price.currency,
        description: product.description,
      }
    },
    revalidate: 60 * 60 * 1, // 1 hours
  }
}