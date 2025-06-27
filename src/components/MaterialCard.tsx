import { ExternalLink, PlayCircle, BookOpen, FileText, GraduationCap, PenTool } from 'lucide-react';
import { Material } from '@/lib/types';
import Image from 'next/image';
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

export default function MaterialCard({ material }: MaterialCardProps) {
    const IconComponent = typeIcons[material.type];
    const typeColorClass = typeColors[material.type];
    const [imageError, setImageError] = useState(false);

    const handleClick = () => {
        window.open(material.url, '_blank', 'noopener,noreferrer');
    };

    const shouldShowImage = material.thumbnail_url &&
        material.thumbnail_url !== 'thumbnail.jpg' &&
        !imageError;

    return (
        <div
            onClick={handleClick}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded-lg overflow-hidden relative">
                    {shouldShowImage ? (
                        <Image
                            src={material.thumbnail_url!}
                            alt={`Thumbnail for ${material.title}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors">
                            {material.title}
                        </h4>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                        {material.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${typeColorClass}`}>
                                {material.type}
                            </span>

                            {material.duration && (
                                <span className="text-xs text-slate-500">
                                    {material.duration}
                                </span>
                            )}
                        </div>

                        {material.author && (
                            <span className="text-xs text-slate-500 truncate max-w-24">
                                {material.author}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}