import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const ReferralSection = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const referralLink = user ? `https://socialtaskhub.com/ref/${user.referralCode}` : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    let shareUrl = '';
    const text = 'Join SocialTask Hub and earn rewards by completing simple social media tasks. Use my referral link:';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Join SocialTask Hub')}&body=${encodeURIComponent(`${text}\n\n${referralLink}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Invite Friends & Earn</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-gray-600 mb-4">
          Share your referral link and earn 10% of your friends' earnings for life!
        </p>
        <div className="flex items-center">
          <Input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
          />
          <Button
            onClick={copyReferralLink}
            className="rounded-l-none bg-primary text-white hover:bg-blue-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="inline-flex items-center px-4 py-2"
            onClick={() => shareOnSocial('facebook')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1877F2] mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>
          <Button
            variant="outline"
            className="inline-flex items-center px-4 py-2"
            onClick={() => shareOnSocial('twitter')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1DA1F2] mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </Button>
          <Button
            variant="outline"
            className="inline-flex items-center px-4 py-2"
            onClick={() => shareOnSocial('linkedin')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0A66C2] mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
            </svg>
            LinkedIn
          </Button>
          <Button
            variant="outline"
            className="inline-flex items-center px-4 py-2"
            onClick={() => shareOnSocial('email')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferralSection;
