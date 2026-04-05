
import React, { useState, useEffect } from 'react';
import { HomePageContent, HeroSlide, MidBannerContent, CategoryShowcaseItem } from '../../types';
import { TrashIcon, PlusIcon, CloudArrowUpIcon } from '../icons';

interface AdminHomepageProps {
    homeContent: HomePageContent;
    setHomeContent: React.Dispatch<React.SetStateAction<HomePageContent>>;
}

export const AdminHomepage: React.FC<AdminHomepageProps> = ({ homeContent, setHomeContent }) => {
    const [slides, setSlides] = useState<HeroSlide[]>(homeContent.heroSlides);
    const [banner, setBanner] = useState<MidBannerContent>(homeContent.midBanner);
    const [categoryShowcase, setCategoryShowcase] = useState<CategoryShowcaseItem[]>(homeContent.categoryShowcase);
    const [isSaved, setIsSaved] = useState(false);

    // Sync state with props to ensure data is up to date when switching tabs or loading
    useEffect(() => {
        setSlides(homeContent.heroSlides);
        setBanner(homeContent.midBanner);
        setCategoryShowcase(homeContent.categoryShowcase);
    }, [homeContent]);

    const handleSlideChange = (index: number, field: keyof HeroSlide, value: any) => {
        setSlides(prev => {
            const newSlides = [...prev];
            (newSlides[index] as any)[field] = value;
            return newSlides;
        });
    };
    
    const handleAddSlide = () => {
        setSlides(prev => [...prev, { imageUrl: "", title: "New Slide", subtitle: "", buttonText: "Shop Now", filters: {} }]);
    }
    
    const handleRemoveSlide = (index: number) => {
        if (slides.length > 1) {
            setSlides(prev => prev.filter((_, i) => i !== index));
        } else {
            alert("You must have at least one slide.");
        }
    }

    const handleBannerChange = (field: keyof Omit<MidBannerContent, 'imageUrl'>, value: string) => {
        setBanner(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSlides(prev => {
                    const newSlides = [...prev];
                    newSlides[index] = { ...newSlides[index], imageUrl: reader.result as string };
                    return newSlides;
                });
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input to allow re-uploading same file
        }
    };

    const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setBanner(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleCategoryShowcaseChange = (index: number, field: 'title', value: string) => {
        setCategoryShowcase(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [field]: value };
            return newItems;
        });
    };

    const handleCategoryShowcaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCategoryShowcase(prev => {
                    const newItems = [...prev];
                    newItems[index] = { ...newItems[index], imageUrl: reader.result as string };
                    return newItems;
                });
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setHomeContent({ heroSlides: slides, midBanner: banner, categoryShowcase });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const inputClass = "block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold dark:bg-brand-surface dark:border-brand-border dark:text-white";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
                Customize the content displayed on your homepage.
            </p>

            <form onSubmit={handleSave}>
                <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Hero Slider</h2>
                    <div className="space-y-6">
                        {slides.map((slide, index) => (
                            <div key={index} className="p-4 border rounded-md dark:border-brand-border relative bg-gray-50 dark:bg-brand-surface/50">
                                <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Slide {index + 1}</h3>
                                {slides.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveSlide(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500">
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor={`slide-title-${index}`} className={labelClass}>Title</label>
                                        <input type="text" id={`slide-title-${index}`} value={slide.title} onChange={(e) => handleSlideChange(index, 'title', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor={`slide-subtitle-${index}`} className={labelClass}>Subtitle</label>
                                        <input type="text" id={`slide-subtitle-${index}`} value={slide.subtitle} onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Image</label>
                                        <div className="mt-1 flex items-center space-x-4">
                                            {slide.imageUrl ? (
                                                <img 
                                                    src={slide.imageUrl} 
                                                    alt={`Slide ${index + 1} preview`} 
                                                    className="h-20 w-32 object-cover rounded-md bg-gray-100 dark:bg-brand-surface border dark:border-brand-border"
                                                />
                                            ) : (
                                                <div className="h-20 w-32 flex items-center justify-center rounded-md bg-gray-100 dark:bg-brand-surface border dark:border-brand-border text-xs text-gray-400">No Image</div>
                                            )}
                                            <label htmlFor={`slide-image-upload-${index}`} className="cursor-pointer bg-white dark:bg-brand-surface py-2 px-3 border border-gray-300 dark:border-brand-border rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <span>Upload Image</span>
                                                <input id={`slide-image-upload-${index}`} name="image-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, index)} />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor={`slide-button-${index}`} className={labelClass}>Button Text</label>
                                        <input type="text" id={`slide-button-${index}`} value={slide.buttonText} onChange={(e) => handleSlideChange(index, 'buttonText', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddSlide} className="mt-4 flex items-center text-sm font-medium text-brand-gold hover:text-yellow-600">
                        <PlusIcon className="h-5 w-5 mr-1"/> Add Slide
                    </button>
                </div>
                
                <div className="mt-8 bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mid-Page Banner</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <label className={labelClass}>Banner Image</label>
                             <div className="mt-1 flex items-center space-x-4">
                                {banner.imageUrl ? (
                                    <img 
                                        src={banner.imageUrl} 
                                        alt="Mid-page banner preview" 
                                        className="h-20 w-40 object-cover rounded-md bg-gray-100 dark:bg-brand-surface border dark:border-brand-border"
                                    />
                                ) : (
                                    <div className="h-20 w-40 flex items-center justify-center rounded-md bg-gray-100 dark:bg-brand-surface border dark:border-brand-border text-xs text-gray-400">No Image</div>
                                )}
                                <label htmlFor="banner-image-upload" className="cursor-pointer bg-white dark:bg-brand-surface py-2 px-3 border border-gray-300 dark:border-brand-border rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <span>Upload Image</span>
                                    <input id="banner-image-upload" name="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleBannerImageUpload} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="banner-title" className={labelClass}>Title</label>
                            <input type="text" id="banner-title" value={banner.title} onChange={(e) => handleBannerChange('title', e.target.value)} className={inputClass} />
                        </div>
                         <div>
                            <label htmlFor="banner-button" className={labelClass}>Button Text</label>
                            <input type="text" id="banner-button" value={banner.buttonText} onChange={(e) => handleBannerChange('buttonText', e.target.value)} className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="banner-subtitle" className={labelClass}>Subtitle</label>
                            <textarea id="banner-subtitle" value={banner.subtitle} onChange={(e) => handleBannerChange('subtitle', e.target.value)} rows={3} className={inputClass} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Category Showcase</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categoryShowcase.map((item, index) => (
                            <div key={index} className="p-4 border rounded-md dark:border-brand-border bg-gray-50 dark:bg-brand-surface/50 space-y-4">
                                <div>
                                    <label htmlFor={`cat-title-${index}`} className={labelClass}>Title</label>
                                    <input type="text" id={`cat-title-${index}`} value={item.title} onChange={(e) => handleCategoryShowcaseChange(index, 'title', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Image</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <img 
                                            src={item.imageUrl} 
                                            alt={`${item.title} preview`} 
                                            className="h-20 w-20 object-cover rounded-md bg-gray-100 dark:bg-brand-surface border dark:border-brand-border"
                                        />
                                        <label htmlFor={`cat-image-upload-${index}`} className="cursor-pointer bg-white dark:bg-brand-surface py-2 px-3 border border-gray-300 dark:border-brand-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <span>Upload</span>
                                            <input id={`cat-image-upload-${index}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleCategoryShowcaseImageUpload(e, index)} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end items-center">
                     {isSaved && <p className="text-sm text-green-600 dark:text-green-400 mr-4">Homepage content saved!</p>}
                    <button
                        type="submit"
                        className="px-8 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600"
                    >
                        Save All Homepage Changes
                    </button>
                </div>
            </form>
        </div>
    );
};
