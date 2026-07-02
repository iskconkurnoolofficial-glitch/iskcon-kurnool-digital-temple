import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/about/iskcon")({
  head: () => ({ meta: [
    { title: "About ISKCON — ISKCON Kurnool" },
    { name: "description", content: "Learn about ISKCON, the Hare Krishna movement founded by A.C. Bhaktivedanta Swami Prabhupada in 1966, and its mission to spread Krishna consciousness worldwide." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Our Heritage" title="About ISKCON" subtitle="The International Society for Krishna Consciousness" pageKey="aboutIskcon" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 prose prose-lg">
          <p className="text-lg text-muted-foreground leading-relaxed">
            The International Society for Krishna Consciousness, also popularly known as the Hare Krishna movement,
            is a spiritual society founded by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada in July 1966 in New York.
            ISKCON belongs to the Gaudiya-Vaishnava sampradaya, a monotheistic tradition within Vedic culture.
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Today ISKCON comprises more than 400 temples, 40 rural communities, and over 100 vegetarian restaurants.
            It also conducts special projects throughout the world, such as Food for Life, the only free vegetarian
            relief program in the world.
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            The aim of ISKCON is to acquaint all people of the world with universal principles of self-realization
            and God consciousness so that they may derive the highest benefit of spiritual understanding, unity, and peace.
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            The Vedic literature recommends that in the present age of Kali-yuga the most effective means of achieving
            self-realization is to always hear about, glorify, and remember the all-attractive Supreme Lord Sri Krishna.
            Therefore, it recommends the chanting of the Holy Names: Hare Krishna Hare Krishna Krishna Krishna Hare Hare
            / Hare Rama Hare Rama Rama Rama Hare Hare. This sublime chanting puts the chanter directly in touch with the
            Supreme Lord through the sound vibration of His Holy Name.
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            ISKCON follows the teachings of the Vedas and Vedic scriptures, including the Bhagavad-gita and Srimad Bhagavatam,
            which teach Vaishnavism or devotion to God (Krishna) in His Supreme Personal aspect of Sri Sri Radha Krishna.
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            These teachings are received through the preceptorial line known as the Brahma-Madhav-Gaudiya Vaishnava sampradaya.
            ISKCON is part of the disciplic succession that began with Lord Krishna Himself and continued through Srila Vyasadeva,
            Srila Madhavacharya, Sri Caitanya Mahaprabhu, and in the present day His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
            and his followers.
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            ISKCON’s teachings are non-sectarian, following the principle of sanatana dharma or eternal religion, which denotes
            the eternal activity of all living beings—loving devotional service (bhakti-yoga) to the Supreme Personality of Godhead.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
