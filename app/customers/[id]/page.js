import CustomerDetails from "./CustomerDetails";

export default function Page({ params }) {
  return <CustomerDetails id={params.id} />;
}
