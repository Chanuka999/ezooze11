
import React, { useState } from 'react';
import { AboutPageContent, CareersPageContent, PressPageContent, FAQPageContent, PrivacyPolicyPageContent, TermsOfServicePageContent, JobOpening, PressFeature, FAQItem, PolicySectionContent } from '../../types';
import { NotificationType } from '../Notification';
import { PlusIcon, TrashIcon } from '../icons';

interface AdminContentProps {
    aboutContent: AboutPageContent;
    setAboutContent: React.Dispatch<React.SetStateAction<AboutPageContent>>;
    careersContent: CareersPageContent;
    setCareersContent: React.Dispatch<React.SetStateAction<CareersPageContent>>;
    pressContent: PressPageContent;
    setPressContent: React.Dispatch<React.SetStateAction<PressPageContent>>;
    faqContent: FAQPageContent;
    setFaqContent: React.Dispatch<React.SetStateAction<FAQPageContent>>;
    privacyPolicyContent: PrivacyPolicyPageContent;
    setPrivacyPolicyContent: React.Dispatch<React.SetStateAction<PrivacyPolicyPageContent>>;
    termsContent: TermsOfServicePageContent;
    setTermsContent: React.Dispatch<React.SetStateAction<TermsOfServicePageContent>>;
    addNotification: (message: string, type: NotificationType) => void;
}

type ContentTab = 'about' | 'careers' | 'press' | 'faq' | 'privacy' | 'terms';
const tabs: { id: ContentTab, name: string }[] = [
    { id: 'about', name: 'About Us' },
    { id: 'careers', name: 'Careers' },
    { id: 'press', name: 'Press' },
    { id: 'faq', name: 'FAQ' },
    { id: 'privacy', name: 'Privacy Policy' },
    { id: 'terms', name: 'Terms of Service' },
];

const inputClass = "block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold dark:bg-brand-surface dark:border-brand-border dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

// --- Sub-Components for each Editor ---

const AboutEditor: React.FC<Pick<AdminContentProps, 'aboutContent' | 'setAboutContent' | 'addNotification'>> = ({ aboutContent, setAboutContent, addNotification }) => {
    const [story, setStory] = useState(aboutContent.story);
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setAboutContent({ story });
        addNotification('About page content saved.', 'success');
    };
    return (
        <form onSubmit={handleSave} className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
            <h2 className="text-xl font-semibold mb-4">"Our Story" Section</h2>
            <textarea id="about-story" rows={8} value={story} onChange={(e) => setStory(e.target.value)} className={inputClass} />
            <div className="mt-6 flex justify-end"><button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600">Save Changes</button></div>
        </form>
    );
};

const CareersEditor: React.FC<Pick<AdminContentProps, 'careersContent' | 'setCareersContent' | 'addNotification'>> = ({ careersContent, setCareersContent, addNotification }) => {
    const [jobs, setJobs] = useState(careersContent);
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); setCareersContent(jobs); addNotification('Careers page saved.', 'success'); };
    const addJob = () => setJobs([...jobs, { id: Date.now().toString(), title: '', location: '', department: '' }]);
    const removeJob = (id: string) => setJobs(jobs.filter(job => job.id !== id));
    const updateJob = (id: string, field: keyof JobOpening, value: string) => {
        setJobs(jobs.map(job => job.id === id ? { ...job, [field]: value } : job));
    };
    return (
        <form onSubmit={handleSave} className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border space-y-4">
             {jobs.map(job => (
                <div key={job.id} className="p-3 border rounded-md dark:border-brand-border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2"><label className={labelClass}>Title</label><input type="text" value={job.title} onChange={e => updateJob(job.id, 'title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Location</label><input type="text" value={job.location} onChange={e => updateJob(job.id, 'location', e.target.value)} className={inputClass} /></div>
                    <div className="flex items-center space-x-2">
                        <div className="flex-grow"><label className={labelClass}>Department</label><input type="text" value={job.department} onChange={e => updateJob(job.id, 'department', e.target.value)} className={inputClass} /></div>
                        <button type="button" onClick={() => removeJob(job.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
             ))}
             <button type="button" onClick={addJob} className="flex items-center text-sm font-medium text-brand-gold hover:text-yellow-600"><PlusIcon className="h-5 w-5 mr-1"/> Add Job Opening</button>
             <div className="mt-6 flex justify-end"><button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600">Save Changes</button></div>
        </form>
    );
};

const PressEditor: React.FC<Pick<AdminContentProps, 'pressContent' | 'setPressContent' | 'addNotification'>> = ({ pressContent, setPressContent, addNotification }) => {
    const [features, setFeatures] = useState(pressContent);
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); setPressContent(features); addNotification('Press page saved.', 'success'); };
    const addFeature = () => setFeatures([...features, { id: Date.now().toString(), publication: '', title: '', date: '', link: '#' }]);
    const removeFeature = (id: string) => setFeatures(features.filter(f => f.id !== id));
    const updateFeature = (id: string, field: keyof PressFeature, value: string) => {
        setFeatures(features.map(f => f.id === id ? { ...f, [field]: value } : f));
    };
    return (
        <form onSubmit={handleSave} className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border space-y-4">
             {features.map(f => (
                <div key={f.id} className="p-3 border rounded-md dark:border-brand-border space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={labelClass}>Publication</label><input type="text" value={f.publication} onChange={e => updateFeature(f.id, 'publication', e.target.value)} className={inputClass} /></div>
                        <div className="md:col-span-2"><label className={labelClass}>Title</label><input type="text" value={f.title} onChange={e => updateFeature(f.id, 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Date</label><input type="text" value={f.date} onChange={e => updateFeature(f.id, 'date', e.target.value)} className={inputClass} /></div>
                        <div className="md:col-span-2"><label className={labelClass}>Link</label><input type="text" value={f.link} onChange={e => updateFeature(f.id, 'link', e.target.value)} className={inputClass} /></div>
                    </div>
                    <button type="button" onClick={() => removeFeature(f.id)} className="text-xs text-red-500 hover:underline">Remove Feature</button>
                </div>
             ))}
             <button type="button" onClick={addFeature} className="flex items-center text-sm font-medium text-brand-gold hover:text-yellow-600"><PlusIcon className="h-5 w-5 mr-1"/> Add Press Feature</button>
             <div className="mt-6 flex justify-end"><button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600">Save Changes</button></div>
        </form>
    );
};

const FAQEditor: React.FC<Pick<AdminContentProps, 'faqContent' | 'setFaqContent' | 'addNotification'>> = ({ faqContent, setFaqContent, addNotification }) => {
    const [faqs, setFaqs] = useState(faqContent);
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); setFaqContent(faqs); addNotification('FAQ page saved.', 'success'); };
    const addFaq = () => setFaqs([...faqs, { id: Date.now().toString(), question: '', answer: '' }]);
    const removeFaq = (id: string) => setFaqs(faqs.filter(f => f.id !== id));
    const updateFaq = (id: string, field: keyof FAQItem, value: string) => {
        setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
    };
    return (
         <form onSubmit={handleSave} className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border space-y-4">
            {faqs.map(faq => (
                <div key={faq.id} className="p-3 border rounded-md dark:border-brand-border space-y-2">
                    <div><label className={labelClass}>Question</label><input type="text" value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Answer</label><textarea rows={3} value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} className={inputClass} /></div>
                    <button type="button" onClick={() => removeFaq(faq.id)} className="text-xs text-red-500 hover:underline">Remove FAQ</button>
                </div>
            ))}
             <button type="button" onClick={addFaq} className="flex items-center text-sm font-medium text-brand-gold hover:text-yellow-600"><PlusIcon className="h-5 w-5 mr-1"/> Add FAQ</button>
             <div className="mt-6 flex justify-end"><button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600">Save Changes</button></div>
        </form>
    );
};

const PolicyEditor: React.FC<{ title: string; content: { sections: PolicySectionContent[] }, setContent: (content: { sections: PolicySectionContent[] }) => void; addNotification: AdminContentProps['addNotification'] }> = ({ title, content, setContent, addNotification }) => {
    const [sections, setSections] = useState(content.sections);
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); setContent({ sections }); addNotification(`${title} saved.`, 'success'); };
    const addSection = () => setSections([...sections, { id: Date.now().toString(), title: 'New Section', content: '' }]);
    const removeSection = (id: string) => setSections(sections.filter(s => s.id !== id));
    const updateSection = (id: string, field: keyof PolicySectionContent, value: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    };
     return (
        <form onSubmit={handleSave} className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border space-y-4">
            {sections.map(section => (
                <div key={section.id} className="p-3 border rounded-md dark:border-brand-border space-y-2">
                    <div><label className={labelClass}>Section Title</label><input type="text" value={section.title} onChange={e => updateSection(section.id, 'title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Content</label><textarea rows={5} value={section.content} onChange={e => updateSection(section.id, 'content', e.target.value)} className={inputClass} /></div>
                    <button type="button" onClick={() => removeSection(section.id)} className="text-xs text-red-500 hover:underline">Remove Section</button>
                </div>
            ))}
             <button type="button" onClick={addSection} className="flex items-center text-sm font-medium text-brand-gold hover:text-yellow-600"><PlusIcon className="h-5 w-5 mr-1"/> Add Section</button>
             <div className="mt-6 flex justify-end"><button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600">Save Changes</button></div>
        </form>
    );
};

export const AdminContent: React.FC<AdminContentProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ContentTab>('about');

    const renderContent = () => {
        switch (activeTab) {
            case 'about': return <AboutEditor {...props} />;
            case 'careers': return <CareersEditor {...props} />;
            case 'press': return <PressEditor {...props} />;
            case 'faq': return <FAQEditor {...props} />;
            case 'privacy': return <PolicyEditor title="Privacy Policy" content={props.privacyPolicyContent} setContent={props.setPrivacyPolicyContent} addNotification={props.addNotification} />;
            case 'terms': return <PolicyEditor title="Terms of Service" content={props.termsContent} setContent={props.setTermsContent} addNotification={props.addNotification} />;
            default: return null;
        }
    }
    
    return (
        <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
                Edit the text content of your website's static pages.
            </p>
            
            <div className="border-b border-gray-200 dark:border-brand-border">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-brand-gold text-brand-gold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};