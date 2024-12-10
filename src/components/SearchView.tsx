import React, { useState, useEffect } from 'react';
import type { SearchResult } from '../types';
import type AIChatPlugin from '../../main';
import { 
    Card, 
    CardHeader, 
    CardContent,
    Input,
    Button 
} from './';

interface SearchViewProps {
    plugin: AIChatPlugin;
    onResultClick: (result: SearchResult) => void;
    onClose: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
    plugin,
    onResultClick,
    onClose
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const searchDebounced = setTimeout(async () => {
            if (query.trim()) {
                setIsSearching(true);
                try {
                    const searchResults = await plugin.searchService.search(query, {
                        includeFiles: true,
                        includeConversations: true,
                        maxResults: 20
                    });
                    setResults(searchResults);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(searchDebounced);
    }, [query]);

    const formatDate = (date?: Date) => {
        return date ? date.toLocaleString() : '';
    };

    return (
        <Card className="search-container">
            <CardHeader>
                <div className="search-header">
                    <Input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search conversations and files..."
                        className="search-input"
                        autoFocus
                    />
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="search-close-button"
                    >
                        ×
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent className="search-results">
                {isSearching ? (
                    <div className="search-loading">Searching...</div>
                ) : results.length > 0 ? (
                    results.map((result, index) => (
                        <Card
                            key={index}
                            className="search-result"
                            onClick={() => onResultClick(result)}
                        >
                            <CardContent>
                                <div className="result-header">
                                    <span className="result-type">
                                        {result.type === 'message' ? '💬' : '📄'}
                                    </span>
                                    <span className="result-title">
                                        {result.source.title}
                                    </span>
                                    {result.source.timestamp && (
                                        <span className="result-date">
                                            {formatDate(result.source.timestamp)}
                                        </span>
                                    )}
                                </div>
                                <div className="result-content">
                                    {result.content}
                                </div>
                                <div className="result-path">
                                    {result.source.path || `Conversation: ${result.source.title}`}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : query.trim() ? (
                    <div className="no-results">No results found</div>
                ) : null}
            </CardContent>
        </Card>
    );
};
