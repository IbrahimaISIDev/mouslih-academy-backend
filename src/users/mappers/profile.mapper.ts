interface PendingRecitationRow {
  submittedAt: Date;
  lesson: {
    submodule: {
      module: { courseId: string; position: number };
    };
  };
}

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  city: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
}

export function mapProfile(
  user: UserRow,
  pendingRecitation: PendingRecitationRow | null,
  lessonsCompletedThisWeek: number,
) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city ?? '',
    email: user.email,
    phone: user.phone ?? '',
    joinedAt: user.createdAt.toISOString(),
    lessonsCompletedThisWeek,
    // Pas de flux de changement de mot de passe branché côté frontend aujourd'hui (formulaire
    // non relié à une API réelle) : on retombe sur la date d'inscription, faute de mieux.
    passwordChangedAt: user.createdAt.toISOString(),
    pendingRecitation: pendingRecitation
      ? {
          courseId: pendingRecitation.lesson.submodule.module.courseId,
          moduleOrder: pendingRecitation.lesson.submodule.module.position,
          submittedDaysAgo: Math.floor(
            (Date.now() - pendingRecitation.submittedAt.getTime()) / 86_400_000,
          ),
        }
      : null,
  };
}
