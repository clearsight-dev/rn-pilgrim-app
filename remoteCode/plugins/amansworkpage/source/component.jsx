import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {datasourceTypeModelSel} from 'apptile-core';
import {fetchCollectionData} from '../../../../extractedQueries/homepageQueries';
import CollectionCarousel from './CollectionCarousel';
import CelebPicks from './CelebPicks';
import BlogCarousel from './BlogCarousel';

// Hardcoded data for carousel UI demonstration
const carouselData = [
  {
    title: 'SKIN CARE',
    subtitle: 'Glow Every Day!',
    tabs: ['By Type', 'By Concern', 'By Ingredient'],
    coverImage:
      'https://s3-alpha-sig.figma.com/img/9bfb/5a5a/0e5496159d8f7ee3eed1dfaee6578a4f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=HhcipHKNL63XQwL7JeUKjU6Cv3lZaAvwEo0H2yVuxTwr8jk-~wCdv2rZ6CB42o6lNg0RUivmkbK9jo90CMq048KJQ2EzVMwKI~f2~4vCcfqwmPEU8b58PlC2xbvKd-ncTUSOcDIuqpqSRzeh~Bs9cfFOE57Yh0vN3qzzb3BLxurr3V9oqJSQmpyp3TSAY4Stjzq-qLmJaCLEY~s8Q75Ekzg7QJuQ22Xmao9qhVP-r-ePbeXtRSiBHpikbCAkmhBhdzM4y00O27jXfFnQEntCLWQ37bBVGp6~ZmY35RPpvPrIa5wXseKhqQEKbdSU4F7IMazfefG84-j5l1nxdqS29w__',
    categories: [
      {
        id: '1',
        title: 'Face Serums',
        image:
          'https://s3-alpha-sig.figma.com/img/6d2b/013a/3fb5359d2a80c7dea0492a1a9d815422?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=C8dszPd9Ku0tiJkusCy9kGw4CW0GqXvp9ipYhyylhRlfsDXrE8J4Z~~zbHsy6yOMoCJR5AP1E008ICawOrVQ7flId0WyL91ryGh4Bvwct~1cYjbKCHD8NTyIS35d7nsskYfRJbJlN6rH2DTSyzMVJK9r1VJV7WDgGlPx9TG7gyPvfDpwBeu6SxzmUkooXkcVxKzNdS3jkJRJOLpgO5IAmwQPxrKupi-efXvYU8w86OlynYLEc08Y9UB~xPlVYRur6BlrT0FGpi778hVEXcYgBYfqwPqYDflILl7T0FLUlsnm0Rtcfmp2moUK9WOwvAsT4Zuwq4RZPovFVtzLxbb1sg__',
      },
      {
        id: '2',
        title: 'Face Masks',
        image:
          'https://s3-alpha-sig.figma.com/img/d41b/f2ce/19423c149f3d2ab8a626095f6ad275f9?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=kU-WhR3WkSp~kPCzJvsUtxA3HD561Pmges88PiJPA6JR-suTC~7XxOn6g6EQvapa78wlTI3R7IF8qyFgUGKAIa8RGHrLClqeJRzJjiBrNVeH8ycwxtXSJvPHfrAsfeZlIu98FiM-xhtZNjXTQCt2i68Bhk4e6eq~nVHJ8QCtgGcZ4Nu3Vd83M7DY1Dg1UArdP2gjBPdwsoojSdsoCEQWHXKgRfw1NqS510rhW0f8HL~GmQOBPdHY5OS8KhovycI5JdlnR9GRnzTeI7AhNMso~5vk7tIWTnzCjmRLW611Xw-NjptuN0HBJWK4PIjJpaZRUU13ryViFu9Ur7Ik-5UXHA__',
      },
      {
        id: '3',
        title: 'Face Wash',
        image:
          'https://s3-alpha-sig.figma.com/img/a009/e734/e6009209dcbaecaf84719e35c8941e64?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=fiWLcfCgJb57uZlS0DQWTj9a4wUxF33It3XM8MQklc1cwL~G~c5kYonit7MYpwkhsjyC5C75aerQwYKmstMd7thnnQzz1jnpfuhuxk7JvVGqX29qjKHoNUiC5kaFraYY1VnFJCVQdK~35IuTZT9mrEuiQGNPtBb4M~6n-HSr-dT-Vpdakx4mt4Nuh-g2fVuhKm2WKy8o3hYLRnN5MLJ~jSmL7qKaXJfuTxdQBDRj66B7Wpo-F01WBU6X5ySUO04zbB9XDeXpAp21vZ8BsxIryM~mI9lcvXzdXFsxUbpoia-BddL~tUL-~1pkQu9z8CP-bP44qKGhxMnSvXyEqPkc3w__',
      },
    ],
  },
  {
    title: 'HAIR CARE',
    subtitle: 'Shine Every Day!',
    tabs: ['By Type', 'By Concern', 'By Ingredient'],
    coverImage:
      'https://s3-alpha-sig.figma.com/img/2f05/72c9/70a04491bffa2a2bde621f85b4c2a29f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=QM28qb8wuaXmvPl0-xfG58mGqNrlHHiZoddsTUZiFSvFBzGVSLg4zFD6LfFQXKibGYN2Bp~YgTaVb-WiGCEDlsd4K7GFhOgqx9S9yw8c~AF9JiC1e1Au7~6eKZHFJswZGFjjtMkb0XCmV0APKRdu-S2ciOD4YkiV8U0e0NjLqiZWu62VsZ50O1ZPZpbtsz0xJAPky9w5dn48UI~uu-U-lzZZjzp21Kyy43norFPKd9rZsV-0AVTYq6N1NVEUkoyn6gvtoHms3x6ABJWrwrbQThD4pdeZizF2~9mA9kDVR8cT~2ANUaKFMuL0Q~K50ClmxCZovXW2NmOj89zprgH-nA__',
    categories: [
      {
        id: '1',
        title: 'Hair Oil',
        image:
          'https://s3-alpha-sig.figma.com/img/4a86/fa68/6e5d86b4ec6e619a2ba4afbac8c18db5?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=WnxbDEqSTLMis4tb8vR9AINsZ8y0ZhgCfycRatRJkBknBuVDseYEIpqi~nF1urNTBNTgQ0WU5nYxD~6a1DUcg7gs~LuYTBTcdsMO63GtnjwEwTzeIwAa2aEJ9xrqVl8ZlGvACpSvzoJyKY80r8g-CJeUcNNRjQoFkkyrvCHK80QuqCvCwQATgP856W8bm8b0qC9yghKqR6w0cBSUF2tnBAqlD5U6lL~-V~7Us~YEUcw4wRWjbSIxh80xc9~yaTnhW~FXLxemvayFU3WlgYzGab6dGd7q7eg4sZWv8LeK7ryRZ6OJwX4hzD5mTcotnpBBfTmESRROa3A5fgkGBv3-SQ__',
      },
      {
        id: '2',
        title: 'Hair Conditioner',
        image:
          'https://s3-alpha-sig.figma.com/img/d28d/8593/b996f9f2ede08ccf41bfc7cccc2bcb00?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=l6W1EZ4hF~q-djBphtTyFN7rSqDvXfx2qxd2y5LGDCI5FClibjPpRrviwUr353QviET1iCofK2iZfqPwttfMN5lJcTVbiJFSvLv30GAZfioKe2WPFx7lb6WG5ap41DHIjjklmQkOhlfXzBTO9vV1Mr4Rh5EusWul-CKNU3KRwdY6HkfL~4NgzytUPgmVSxo06j6Vx08JaymPS5Co~pQ5nDfF4BE4jvRCBRddqlMpuT~GnJMJp4jueJg4vZZ6aIeVm7PtvkXsGMeKQZkOi5m8pPKITECyY5GUc4d2dwpLGNtiVKH81HV0nq~VphiCvYEjvcDUtyYS4rdni2mM4daiHw__',
      },
      {
        id: '3',
        title: 'Hair Serum',
        image:
          'https://s3-alpha-sig.figma.com/img/5c7a/a266/b15ae60ee5f0977a4b5d54a0f03dc226?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=A4P79zvZY6kgFCjYeBTl6SEp27e3JSnSHJuANCm8Gq1S5gxAcoQC7WIPsof4c6zK7hOkygqp33VM0Et58wyPSSEsJhFJBYB~9s8HmyQpwBgfGK7Kv770oZohCyh1PPm2cCdpxCrRfCfTRAmpWguVCgkr~war8qJf-XJD2UPjIlk4xCrkQR9Lq28nzIzDovXOeZcC8zHirDSxGyPr537l6l041TZSB3iSuDi7lenGgs-5coa7W69gDyeHgarGj~mi2pSGWb2nL96IeZ59gW7Om2vAgo-CH4A1FvlD3MeWbjJPDO74QuHqf-pwT0G5lF71sncDQ2toQxU5n71c~~qPVw__',
      },
    ],
  },
];

// Hardcoded data for blog carousel
const blogCarouselData = {
  title: 'The Blog Hub',
  subtitle: 'Stories, Tips, and More',
  blogs: [
    {
      id: '1',
      handle: '7-benefits-and-uses-of-vitamin-c-serum',
      title: '7 Benefits And Uses Of Vitamin C Serum',
      description: 'Know the benefits of applying serum and know how',
      image:
        'https://s3-alpha-sig.figma.com/img/132a/6365/4a08e966bf6da3ed0dd0f71d26c5678e?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=mfiUxYGwMtHOLqTwg1WrAzUwTuLzPN61mw7knMh~tqOGKgsAnvo1ctJko3FA6~wC1gaztiZcht--KF3~~b3seqV3okCVWldY0HoLMD9gztOYG4kFngwsga4j04BGxpxMg7J~Exmg~CMcKNSkHwN0rkkfXKOFv-O2OtQKYngxsJf5FRw50l5UHJZqn8TKRLR-vXmQo~C2Koax6jm1F7HjV2uXUQt-iZpteqvnWZKAXMQCbwf64MPAYoDmQ3pxrTsHxX4o0qfy2gQIHHOpgcv2WicIjYfdr14FKPiyVtfCaDCZKrTY5rbwRcYbmEtr~Iax5cSE0G77UJ6I2bgMP5AvxA__',
    },
    {
      id: '2',
      handle: 'how-to-choose-the-right-sunscreen',
      title: 'How To Choose The Right Sunscreen',
      description: 'Learn how to pick the perfect sunscreen for your skin type',
      image:
        'https://s3-alpha-sig.figma.com/img/132a/6365/4a08e966bf6da3ed0dd0f71d26c5678e?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=mfiUxYGwMtHOLqTwg1WrAzUwTuLzPN61mw7knMh~tqOGKgsAnvo1ctJko3FA6~wC1gaztiZcht--KF3~~b3seqV3okCVWldY0HoLMD9gztOYG4kFngwsga4j04BGxpxMg7J~Exmg~CMcKNSkHwN0rkkfXKOFv-O2OtQKYngxsJf5FRw50l5UHJZqn8TKRLR-vXmQo~C2Koax6jm1F7HjV2uXUQt-iZpteqvnWZKAXMQCbwf64MPAYoDmQ3pxrTsHxX4o0qfy2gQIHHOpgcv2WicIjYfdr14FKPiyVtfCaDCZKrTY5rbwRcYbmEtr~Iax5cSE0G77UJ6I2bgMP5AvxA__',
    },
    {
      id: '3',
      handle: 'top-5-ingredients-for-acne-prone-skin',
      title: 'Top 5 Ingredients For Acne-Prone Skin',
      description: 'Discover the best ingredients to combat acne effectively',
      image:
        'https://s3-alpha-sig.figma.com/img/132a/6365/4a08e966bf6da3ed0dd0f71d26c5678e?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=mfiUxYGwMtHOLqTwg1WrAzUwTuLzPN61mw7knMh~tqOGKgsAnvo1ctJko3FA6~wC1gaztiZcht--KF3~~b3seqV3okCVWldY0HoLMD9gztOYG4kFngwsga4j04BGxpxMg7J~Exmg~CMcKNSkHwN0rkkfXKOFv-O2OtQKYngxsJf5FRw50l5UHJZqn8TKRLR-vXmQo~C2Koax6jm1F7HjV2uXUQt-iZpteqvnWZKAXMQCbwf64MPAYoDmQ3pxrTsHxX4o0qfy2gQIHHOpgcv2WicIjYfdr14FKPiyVtfCaDCZKrTY5rbwRcYbmEtr~Iax5cSE0G77UJ6I2bgMP5AvxA__',
    },
  ],
};

export function ReactComponent({model}) {
  // const shopifyDSModel = useSelector(state =>
  //   datasourceTypeModelSel(state, 'shopifyV_22_10'),
  // );
  // const [data, setData] = useState(null);

  // useEffect(() => {
  //   const queryRunner = shopifyDSModel?.get('queryRunner');
  //   fetchCollectionData(queryRunner, 'bestseller-combos')
  //     .then(res => {
  //       setData(res);
  //     })
  //     .catch(err => {
  //       console.error(err.toString());
  //     });
  // }, [shopifyDSModel]);

  return (
    <View>
      {/* Render existing carousel components */}
      {carouselData.map(data => (
        <CollectionCarousel carouselData={data} key={data.title} />
      ))}

      {/* Render the BlogCarousel component */}
      <BlogCarousel carouselData={blogCarouselData} />
    </View>
  );
}

export const WidgetConfig = {};

export const WidgetEditors = {
  basic: [],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Collection Categories',
  defaultProps: {},
};
