import { Copy } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface InviteLinkBannerProps {
  inviteLink: string;
  onCopy: () => void;
  onClose: () => void;
}

export function InviteLinkBanner({ inviteLink, onCopy, onClose }: InviteLinkBannerProps) {
  return (
    <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <p className="font-medium mb-1">Чакыруу шилтемеси (колдонуучуга жөнөтүңүз):</p>
          <p className="text-sm break-all font-mono bg-white px-2 py-1 rounded border border-blue-200">{inviteLink}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            Көчүрүү
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Жабуу
          </Button>
        </div>
      </div>
    </div>
  );
}
