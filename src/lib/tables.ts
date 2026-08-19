export const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface TableStyle { card: string; text: string; shadow: string }

export const TABLE_STYLES: Record<number, TableStyle> = {
  2:  { card: 'bg-sky-soft',   text: 'text-[#2e8fdb]', shadow: 'shadow-[0_5px_0_#cfe3f7]' },
  3:  { card: 'bg-mint-soft',  text: 'text-[#22a76b]', shadow: 'shadow-[0_5px_0_#c4ecda]' },
  4:  { card: 'bg-sun-soft',   text: 'text-[#c98f0e]', shadow: 'shadow-[0_5px_0_#f3e0b1]' },
  5:  { card: 'bg-coral-soft', text: 'text-[#de5646]', shadow: 'shadow-[0_5px_0_#f6d0c9]' },
  6:  { card: 'bg-grape-soft', text: 'text-[#7a55e0]', shadow: 'shadow-[0_5px_0_#ddd0f6]' },
  7:  { card: 'bg-candy-soft', text: 'text-[#e06693]', shadow: 'shadow-[0_5px_0_#f6d0e0]' },
  8:  { card: 'bg-sky-soft',   text: 'text-[#2e8fdb]', shadow: 'shadow-[0_5px_0_#cfe3f7]' },
  9:  { card: 'bg-mint-soft',  text: 'text-[#22a76b]', shadow: 'shadow-[0_5px_0_#c4ecda]' },
  10: { card: 'bg-sun-soft',   text: 'text-[#c98f0e]', shadow: 'shadow-[0_5px_0_#f3e0b1]' },
};