type Props = {
  title:string
}

const FormTitle = ({ title }: Props) => {
  return (
    <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left text-bg-logo">
      { title }
    </h1>
  );
}

export default FormTitle;