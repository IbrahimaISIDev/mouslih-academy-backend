/** Partagé entre le catalogue public et l'éditeur admin : arbre complet formation → modules →
 * sous-modules → leçons (traductions, vidéo, ressources). */
export const COURSE_DETAIL_INCLUDE = {
  translations: true,
  modules: {
    orderBy: { position: 'asc' as const },
    include: {
      translations: true,
      submodules: {
        orderBy: { position: 'asc' as const },
        include: {
          translations: true,
          lessons: {
            orderBy: { position: 'asc' as const },
            include: {
              translations: true,
              video: true,
              resources: { include: { translations: true } },
            },
          },
        },
      },
    },
  },
};
