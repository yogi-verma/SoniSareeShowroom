import SareeCollection from "../SareeCollection";
import heroImage from "../../../assets/SareeSection/Cotton-Saree.avif";

export default function Cotton() {
  return (
    <SareeCollection
      category="Cotton and Handloom"
      heroImage={heroImage}
      title="Cotton & Handloom Sarees"
      editTitle="Cotton & Handloom"
      description="Find breathable handloom cottons, easy everyday drapes and beautiful regional weaves made for comfort from morning to evening."
    />
  );
}
