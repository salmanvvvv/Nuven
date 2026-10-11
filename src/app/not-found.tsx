import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-24">
      <Container>
        <h1 className="max-w-[16ch] text-[clamp(2.5rem,7vw,5rem)] leading-[1] font-semibold tracking-[-0.045em]">
          Esta página no existe.
        </h1>
        <p className="mt-6 max-w-[44ch] text-lg text-muted">Puede que el enlace esté roto o que la página se haya movido.</p>
        <ButtonLink href="/" arrow className="mt-10">
          Volver al inicio
        </ButtonLink>
      </Container>
    </section>
  );
}
