import SareeCollection from "../SareeCollection";

// Occasion edits can contain products from any saree category, so this page shows all live saree stock.
export default function Festival() {
  return (
    <SareeCollection
      title="Festival Sarees"
      editTitle="Festival"
      description="Dress for every joyful gathering in vivid colours, luminous weaves and occasion-ready details chosen for your festive wardrobe."
    />
  );
}
