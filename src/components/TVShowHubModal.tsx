import React from 'react';
import { LiveTVAndMediaPortalModal } from './LiveTVAndMediaPortalModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TVShowHubModal: React.FC<Props> = (props) => {
  return <LiveTVAndMediaPortalModal {...props} />;
};

export { LiveTVAndMediaPortalModal };
