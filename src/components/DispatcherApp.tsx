'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    FolderPlus,
    Download,
    Trash2,
    GripVertical,
    FileVideo,
    X,
    LayoutGrid,
    Menu
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { VirtualFolder, FootageFile } from '@/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Sortable Item Component ---
function SortableFileItem({
    file,
    index,
    onDelete
}: {
    file: FootageFile;
    index: number;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative flex flex-col items-center bg-gray-800 rounded-lg p-2 border border-gray-700 hover:border-blue-500 transition-colors"
        >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onDelete(file.id)}
                    className="p-1 bg-red-500/80 hover:bg-red-600 rounded-full text-white"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-900/50 rounded"
            >
                <GripVertical size={16} className="text-gray-300" />
            </div>

            {/* Thumbnail */}
            <div className="w-full aspect-video bg-black rounded mb-2 overflow-hidden flex items-center justify-center">
                {file.file.type.startsWith('video') ? (
                    <video
                        src={file.previewUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                        }}
                    />
                ) : (
                    <FileVideo size={32} className="text-gray-500" />
                )}
            </div>

            {/* Info */}
            <div className="w-full text-xs text-center text-gray-300">
                <div className="font-mono text-blue-400 font-bold mb-0.5">#{String(index + 1).padStart(3, '0')}</div>
                <div className="truncate w-full px-1" title={file.originalName}>{file.originalName}</div>
            </div>
        </div>
    );
}

// --- Main Component ---
export default function DispatcherApp() {
    const [folders, setFolders] = useState<VirtualFolder[]>([
        { id: '1', name: 'A_Melo', files: [] },
        { id: '2', name: 'B_Melo', files: [] },
        { id: '3', name: 'Chorus', files: [] },
    ]);
    const [activeFolderId, setActiveFolderId] = useState<string>('1');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Handlers ---

    const addFolder = () => {
        const newFolder: VirtualFolder = {
            id: crypto.randomUUID(),
            name: 'New Folder',
            files: []
        };
        setFolders([...folders, newFolder]);
        setActiveFolderId(newFolder.id);
        // Immediately start renaming the new folder
        setTimeout(() => setEditingFolderId(newFolder.id), 50);
    };

    const deleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('このフォルダを削除しますか？中のファイルも消えます。')) {
            setFolders(folders.filter(f => f.id !== id));
            if (activeFolderId === id && folders.length > 1) {
                setActiveFolderId(folders.find(f => f.id !== id)?.id || '');
            }
        }
    };

    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

    const startRename = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingFolderId(id);
    };

    const finishRename = (id: string, newName: string) => {
        if (newName.trim()) {
            setFolders(folders.map(f => f.id === id ? { ...f, name: newName.trim() } : f));
        }
        setEditingFolderId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setFolders((items) => {
                const newFolders = [...items];
                const folderIndex = newFolders.findIndex(f => f.id === activeFolderId);
                if (folderIndex === -1) return items;

                const folder = newFolders[folderIndex];
                const oldIndex = folder.files.findIndex((f) => f.id === active.id);
                const newIndex = folder.files.findIndex((f) => f.id === over?.id);

                // Return new state
                newFolders[folderIndex] = {
                    ...folder,
                    files: arrayMove(folder.files, oldIndex, newIndex)
                };
                return newFolders;
            });
        }
    };

    const onFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if finding files
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);

            const newFootageFiles: FootageFile[] = droppedFiles.map(file => ({
                id: crypto.randomUUID(),
                originalName: file.name,
                file: file,
                previewUrl: URL.createObjectURL(file)
            }));

            setFolders(prev => {
                return prev.map(f => {
                    if (f.id === activeFolderId) {
                        return {
                            ...f,
                            files: [...f.files, ...newFootageFiles]
                        };
                    }
                    return f;
                });
            });
        }
    }, [activeFolderId]);

    const deleteFile = (fileId: string) => {
        setFolders(prev => prev.map(f => {
            if (f.id === activeFolderId) {
                return {
                    ...f,
                    files: f.files.filter(file => file.id !== fileId)
                };
            }
            return f;
        }));
    };

    // --- Export ---
    const handleExport = async () => {
        const zip = new JSZip();

        // Add files to zip with hierarchy
        folders.forEach(folder => {
            if (folder.files.length > 0) {
                const folderRef = zip.folder(folder.name);
                if (folderRef) {
                    folder.files.forEach((footage, index) => {
                        const extension = footage.originalName.split('.').pop() || 'mp4';
                        // Renaming logic: FolderName_001.mp4
                        const newName = `${folder.name}_${String(index + 1).padStart(3, '0')}.${extension}`;
                        folderRef.file(newName, footage.file);
                    });
                }
            }
        });

        try {
            const content = await zip.generateAsync({ type: "blob" });

            // Prepare FormData for Server Action
            const formData = new FormData();
            formData.append('file', content, 'data.zip');

            const btn = document.getElementById('export-btn') as HTMLButtonElement;
            if (btn) {
                btn.disabled = true;
                btn.innerText = "Saving to Desktop...";
            }

            const { saveZipToDesktop } = await import('@/app/actions');
            const result = await saveZipToDesktop(formData);

            if (result.success) {
                alert(`デスクトップに保存しました！\n${result.path}`);
            } else {
                alert(`保存に失敗しました...\n${result.error}`);
            }

            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg><span>Export ZIP</span>';
            }

        } catch (error) {
            console.error("Export failed", error);
            alert("Export failed");
        }
    };

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            folders.forEach(f => {
                f.files.forEach(file => URL.revokeObjectURL(file.previewUrl));
            });
        };
    }, []); // Only run on unmount basically for this simplified version, or we could track more carefully

    const activeFolder = folders.find(f => f.id === activeFolderId);

    return (
        <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h1 className="font-bold text-lg tracking-wider">DISPATCHER</h1>
                    <button onClick={addFolder} className="p-1 hover:bg-gray-800 rounded text-blue-400">
                        <FolderPlus size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            onClick={() => setActiveFolderId(folder.id)}
                            className={twMerge(
                                "group flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors",
                                activeFolderId === folder.id ? "bg-blue-900/30 text-blue-300" : "hover:bg-gray-900 text-gray-400"
                            )}
                        >
                            <div
                                className="flex items-center gap-2 truncate flex-1"
                                onDoubleClick={(e) => startRename(folder.id, e)}
                                title="Double click to rename"
                            >
                                <LayoutGrid size={16} className="shrink-0" />
                                {editingFolderId === folder.id ? (
                                    <input
                                        type="text"
                                        autoFocus
                                        defaultValue={folder.name}
                                        onBlur={(e) => finishRename(folder.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') finishRename(folder.id, e.currentTarget.value);
                                            if (e.key === 'Escape') setEditingFolderId(null);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-gray-800 text-white px-1 py-0.5 rounded outline-none border border-blue-500 w-full"
                                    />
                                ) : (
                                    <span className="truncate">{folder.name}</span>
                                )}

                                <span className={twMerge(
                                    "text-xs text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded-full shrink-0 ml-auto",
                                    editingFolderId === folder.id ? "hidden" : ""
                                )}>
                                    {folder.files.length}
                                </span>
                            </div>
                            <button
                                onClick={(e) => deleteFolder(folder.id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <button
                        id="export-btn"
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} />
                        <span>Export ZIP</span>
                    </button>

                    <div className="flex justify-center gap-4 mt-4 text-[10px] text-gray-500">
                        <a href="/terms" className="hover:text-gray-300" target="_blank">利用規約</a>
                        <a href="/privacy" className="hover:text-gray-300" target="_blank">プライバシー</a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gray-900">
                {activeFolder ? (
                    <>
                        {/* Folder Header */}
                        <div className="h-14 border-b border-gray-800 flex items-center px-6 bg-gray-900/50 backdrop-blur-sm z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-gray-500">Folder /</span>
                                <span>{activeFolder.name}</span>
                            </h2>
                        </div>

                        {/* Drop Zone & Grid */}
                        <div
                            className="flex-1 overflow-y-auto p-6"
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={onFileDrop}
                        >
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={activeFolder.files.map(f => f.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {activeFolder.files.map((file, index) => (
                                            <SortableFileItem
                                                key={file.id}
                                                file={file}
                                                index={index}
                                                onDelete={deleteFile}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {activeFolder.files.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl m-4 pb-20">
                                    <FileVideo size={64} className="mb-4 opacity-20" />
                                    <p className="text-xl font-medium mb-1">Drag video files here</p>
                                    <p className="text-sm opacity-60">from Eagle or Finder</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select or create a folder to start
                    </div>
                )}
            </div>
        </div>
    );
}

