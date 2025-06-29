import { ExternalLink, PlayCircle, BookOpen, FileText, GraduationCap, PenTool } from 'lucide-react';
import { Material } from '@/lib/types';
import { useState } from 'react';

interface MaterialCardProps {
    material: Material;
}

const typeIcons = {
    video: PlayCircle,
    article: FileText,
    book: BookOpen,
    course: GraduationCap,
    exercise: PenTool,
};

const typeColors = {
    video: 'bg-red-500/20 text-red-400 border-red-500/30',
    article: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    book: 'bg-green-500/20 text-green-400 border-green-500/30',
    course: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    exercise: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const typeDisplayNames = {
    video: 'Video',
    article: 'Article',
    book: 'Book',
    course: 'Course',
    exercise: 'Exercise',
};

export default function MaterialCard({ material }: MaterialCardProps) {
    const IconComponent = typeIcons[material.type];
    const typeColorClass = typeColors[material.type];
    const typeDisplayName = typeDisplayNames[material.type]; 
    const [imageError, setImageError] = useState(false);

    const handleClick = () => {
        window.open(material.url, '_blank', 'noopener,noreferrer');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const shouldShowImage = material.thumbnail_url &&
        material.thumbnail_url !== 'thumbnail.jpg' &&
        !imageError;

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Open ${material.title} - ${typeDisplayName}`}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-full flex flex-col"
        >
            <div className="w-full h-32 bg-slate-700 rounded-lg overflow-hidden relative mb-3 flex-shrink-0">
                {shouldShowImage ? (
                    <img
                        src={material.thumbnail_url!}
                        alt={`Thumbnail for ${material.title}`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <IconComponent className="w-12 h-12 text-slate-400" />
                    </div>
                )}

                <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-3 h-3 text-white group-hover:text-cyan-400 transition-colors" />
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors mb-2 min-h-[2.5rem]">
                    {material.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-3 mb-3 flex-1">
                    {material.description}
                </p>

                <div className="space-y-2 mt-auto">
                    <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${typeColorClass}`}>
                            {typeDisplayName}
                        </span>

                        {material.duration && (
                            <span className="text-xs text-slate-500">
                                {material.duration}
                            </span>
                        )}
                    </div>

                    {material.author && (
                        <div className="text-xs text-slate-500 truncate">
                            by {material.author}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}