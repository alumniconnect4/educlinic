import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStore } from '../store/mockData';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { CoverImageUpload } from '../components/create-post/CoverImageUpload';
import { PostEditor } from '../components/create-post/PostEditor';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { addPost } = useStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const predefinedTags = [
    'campus',
    'events',
    'coding',
    'sports',
    'placements',
    'hackathon',
    'clubs',
    'interview',
    'experience',
    'roadmap',
    'information',
    'ai',
    'discussions',
    'projects',
    'internships',
    'research',
    'opportunities',
    'help',
    'announcements',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 4
          ? [...prev, tag]
          : prev
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (title.trim() && content.trim()) {
      setIsPublishing(true);
      // Simulate network request
      setTimeout(() => {
        addPost(title, content, coverImage, selectedTags);
        setIsPublishing(false);
        navigate('/');
      }, 600);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-4">
      <div className="flex items-center justify-between bg-card border border-border/80 rounded-md p-3 px-4 shadow-2xs">
        <span className="font-bold text-lg text-foreground">
          Create Article
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="bg-card border border-border/80 rounded-md p-6 sm:p-8 space-y-6 shadow-2xs">
        <CoverImageUpload
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          onFileUpload={handleImageUpload}
        />

        <Input
          placeholder="New post title here..."
          className="text-3xl sm:text-4xl font-extrabold h-auto py-2 px-0 border-none shadow-none focus-visible:ring-0 rounded-none placeholder:text-muted-foreground/40 text-foreground"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="border-b border-border/40 pb-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Select up to 4 tags:
          </p>
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={!isSelected && selectedTags.length >= 4}
                  className={`text-xs px-3 py-1.5 rounded-full font-mono transition-colors ${
                    isSelected
                      ? 'bg-[#3b49df] text-white'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        <PostEditor content={content} onChange={setContent} />

        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
          <div className="flex gap-3">
            <Button
              onClick={handlePublish}
              disabled={!title.trim() || !content.trim() || isPublishing}
              className="bg-[#3b49df] hover:bg-[#2f3ab2] text-white font-medium px-6 rounded-md shadow-xs"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTitle('');
              setContent('');
              setCoverImage('');
              setSelectedTags([]);
            }}
            className="text-muted-foreground"
          >
            Revert changes
          </Button>
        </div>
      </div>
    </div>
  );
};
