export type TeamSlide = {
  readonly type: 'team';
  readonly image: string;
  readonly title: string;
};

export type SponsorSlide = {
  readonly type: 'sponsor';
  readonly title: string;
  readonly entries: readonly SponsorEntry[];
};

export type SponsorEntry = SponsorLogo | PrivateSupporter;

export type SponsorLogo = {
  readonly name: string;
  readonly logo: string;
};

export type PrivateSupporter = {
  readonly name: string;
  readonly place: string;
};
