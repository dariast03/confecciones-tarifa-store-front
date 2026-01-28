import { gql } from '@apollo/client';

export const PRODUCT_CORE_FRAGMENT = gql`
  fragment ProductCore on Product {
    id
    sku
    type
    name
    price
    urlKey
    combinations
    superAttributeOptions
    baseImageUrl
    minimumPrice
    specialPrice
    isSaleable
  }
`;

export const PRODUCT_DETAILED_FRAGMENT = gql`
  fragment ProductDetailed on Product {
    id
    sku
    type
    name
    urlKey
    description
    shortDescription
    price
    baseImageUrl
    combinations
    superAttributeOptions
    images {
      edges {
        node {
          id
          publicPath
        }
      }
    }
    minimumPrice
    specialPrice
    isSaleable
    variants {
      edges {
        node {
          id
          sku
          price
          baseImageUrl
          images {
            edges {
              node {
                id
                publicPath
              }
            }
          }
        }
      }
    }
    reviews {
      edges {
        node {
          rating
          id
          name
          title
          comment
          createdAt
        }
      }
    }
  }
`;

export const PRODUCT_REVIEW_FRAGMENT = gql`
  fragment ProductReview on Review {
    rating
    id
    _id
    name
    title
    comment
  }
`;

export const PRODUCT_SECTION_FRAGMENT = gql`
  fragment ProductSection on Product {
    id
    sku
    name
    urlKey
    type
    baseImageUrl
    price
    minimumPrice
    isSaleable
  }
`;

export const PRODUCT_GALLERY_FRAGMENT = gql`
  fragment ProductGallery on Product {
    id
    sku
    type
    name
    price
    urlKey
    combinations
    superAttributeOptions
    baseImageUrl
    minimumPrice
    specialPrice
    isSaleable
    variants {
      edges {
        node {
          id
          sku
          baseImageUrl
          price
          type
          name
          isSaleable
          superAttributeOptions
          parent {
            id
            urlKey
            name
          }
          images {
            edges {
              node {
                id
                publicPath
              }
            }
          }
        }
      }
    }
  }
`;
