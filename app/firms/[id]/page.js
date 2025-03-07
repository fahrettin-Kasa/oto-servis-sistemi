import FirmDetails from "./FirmDetails";

export default function Page({ params }) {
  return <FirmDetails id={params.id} />;
}
