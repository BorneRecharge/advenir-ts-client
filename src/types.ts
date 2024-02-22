export type Operation = {
  id: string;
  startAt: Date;
  stopAt: Date;
  totalEnergyWh: number;
};

export type Station = {
  id: string;
  operations: Operation[];
};

export type OperationTransaction = {
  StartTransaction: number;
  StopTransaction: number;
  StartValue: number;
  StopValue: number;
};

export type OperationStation = {
  [id: string]: OperationTransaction;
};

export type OperationUser = {
  [id: string]: OperationStation;
};

export type OperationBody = {
  [id: string]: OperationUser;
};

export const OperationErrors: { [code: number]: string } = {
  101: "Le format des données envoyées n'est pas celui attendu",
  103: 'Impossible de parser le json',
  104: 'Le UserID est invalide',
  201: 'Les index ne sont pas croissants (à timestamp croissant)',
  202: 'La session est déjà enregistrée sur le serveur',
  203: 'Il y a plus de 12h entre 2 index consécutifs',
};

export type TransactionReference = {
  id: string;
  stationId: string;
  userId: string;
};

export type OperationError = {
  code: keyof typeof OperationErrors;
  description: string;
  transaction?: TransactionReference;
};

export type OperationErrorDetails = {
  [code in keyof typeof OperationErrors]: number[] | undefined;
};

export type OperationResponse = {
  statut: 'OK' | 'ECHEC';
  details: OperationErrorDetails;
};

export type Offer = {
  name: string;
};

export type Bonus = {
  id: number;
  is_in_last_advenir_program_version: boolean;
  reference: string;
  offer: Offer;
  prev_cancelled_date: string | null;
  signature_date: string | null;
  step:
    | 'SIGNED'
    | 'SIGNED_AFTER_MODIF'
    | 'COMPLETED'
    | 'EMPTY'
    | 'REWARDED'
    | 'IMPROPER'
    | 'MODIF_REQUESTED';
  validation_date: string | null;
  is_infraco: boolean;
  is_cancelled: boolean;
  modif_requested_date: string | null;
  improper_date: string | null;
  rewarding_date: string | null;
  auto_cancelled_date: string | null;
  sent_docs_date: string | null;
  refused_double_validation_date: string | null;
  billing_date: string | null;
  invoice_file: string | null;
  distribution_administrator_billing_date: string | null;
  offer_file: string | null;
};

export type BonusPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Bonus[];
};
