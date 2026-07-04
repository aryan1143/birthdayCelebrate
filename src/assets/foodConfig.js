import dango from './rimuru treats/Dango.png'
import dorayaki from './rimuru treats/Dorayaki.png'
import melonpan from './rimuru treats/Melonpan.png'
import purin from './rimuru treats/Purin.png'
import sakuraMochi from './rimuru treats/Sakura Mochi.png'
import strawberryDaifuku from './rimuru treats/Strawberry Daifuku.png'
import taiyaki from './rimuru treats/Taiyaki.png'
import usagiManjuu from './rimuru treats/Usagi Manjuu.png'
import yatsuhashi from './rimuru treats/Yatsuhashi.png'
import youkan from './rimuru treats/Youkan.png'

export const FOOD_ITEMS = [
  { id: 'dango', imageSrc: dango, good: true, name: 'Dango' },
  { id: 'dorayaki', imageSrc: dorayaki, good: true, name: 'Dorayaki' },
  { id: 'melonpan', imageSrc: melonpan, good: true, name: 'Melonpan' },
  { id: 'purin', imageSrc: purin, good: true, name: 'Purin' },
  { id: 'sakura-mochi', imageSrc: sakuraMochi, good: true, name: 'Sakura Mochi' },
  { id: 'strawberry-daifuku', imageSrc: strawberryDaifuku, good: true, name: 'Strawberry Daifuku' },
  { id: 'taiyaki', imageSrc: taiyaki, good: true, name: 'Taiyaki' },
  { id: 'usagi-manjuu', imageSrc: usagiManjuu, good: true, name: 'Usagi Manjuu' },
  { id: 'yatsuhashi', imageSrc: yatsuhashi, good: false, name: 'Yatsuhashi' },
  { id: 'youkan', imageSrc: youkan, good: false, name: 'Youkan' },
]

export const FOOD_BY_ID = Object.fromEntries(FOOD_ITEMS.map((item) => [item.id, item]))

export function getRandomFoodId() {
  const item = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)]
  return item.id
}
