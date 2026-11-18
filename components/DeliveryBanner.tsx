import Link from "next/link";

export function DeliveryBanner() {
  return (
    <section
      id="livraison"
      aria-labelledby="livraison-titre"
      className="mx-auto my-9 flex min-h-[130px] w-[min(1200px,calc(100%-22px))] flex-col items-start justify-between gap-4 rounded-[19px] bg-gradient-to-br from-[#087b35] via-[#15a54b] to-[#e8c928] px-[17px] py-5 text-white min-[560px]:flex-row min-[560px]:items-center sm:min-h-[155px] sm:w-[min(1200px,calc(100%-44px))] sm:rounded-3xl sm:px-[5%] sm:py-6"
    >
      <div className="flex items-center gap-2.5 sm:gap-5">
        <span aria-hidden="true" className="text-[35px] sm:text-5xl">🛵</span>
        <div>
          <h2 id="livraison-titre" className="mb-1 text-[19px] font-extrabold sm:text-[27px]">Livraison rapide</h2>
          <p className="text-xs text-[#e7ffe9] sm:text-sm">
            À Paris et dans toute l&apos;Île-de-France. Faites-vous livrer vos saveurs préférées.
          </p>
        </div>
      </div>
      <Link href="/aisles" className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-full bg-[#ffdc37] px-5 py-2.5 text-sm font-extrabold text-[#5a3500] min-[560px]:w-auto sm:px-[22px] sm:text-base">
        Commander maintenant →
      </Link>
    </section>
  );
}
