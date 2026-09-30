import { SetMetadata } from '@nestjs/common';

export const CLE_PUBLIQUE = 'estPublique';
export const Publique = () => SetMetadata(CLE_PUBLIQUE, true);