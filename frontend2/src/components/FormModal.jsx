import { X, Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memberApi } from '../lib/member-api'
import { useEffect } from 'react'

export default function FormModal({ isOpen, onClose, initialData }) {
    const queryClient = useQueryClient()
    const isEditMode = !!initialData
    
    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { errors } 
    } = useForm()

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    nickname: initialData.nickname,
                    generation: initialData.generation
                })
            } else {
                reset({
                    name: '',
                    nickname: '',
                    generation: ''
                })
            }
        }
    }, [isOpen, initialData, reset])

    const createMutation = useMutation({
        mutationFn: memberApi.createMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members']})
            onClose()
            reset()
        },
        onError: (error) => alert(`Gagal tambah member: ${error.message}`)
    })

    const updateMutation = useMutation({
        mutationFn: (data) => memberApi.updateMember(initialData.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['members']})
            onClose()
            reset()
        },
        onError: (error) => alert(`Gagal update member: ${error.message}`)
    })

    const mutation = isEditMode ? updateMutation : createMutation

    const onSubmit = (data) => {
        const payload = {
            ...data,
            generation: parseInt(data.generation)
        }
        mutation.mutate(payload)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">{isEditMode ? 'Edit Member' : 'Add New Member'}</h3>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            {...register("name", { required: "Nama wajib diisi" })}
                            type="text" 
                            placeholder="e.g. Shani Indira Natio"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE1D52] transition ${errors.name ? 'border-red-500' : 'border-slate-300'}`}/>
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nickname</label>
                        <input 
                            {...register("nickname", { required: "Nickname wajib diisi" })}
                            type="text" 
                            placeholder="e.g. Shani"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE1D52] transition ${errors.nickname ? 'border-red-500' : 'border-slate-300'}`}/>
                        {errors.nickname && <span className="text-xs text-red-500">{errors.nickname.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Generation</label>
                        <input 
                            {...register("generation", { required: "Generasi wajib diisi", min: 1 })}
                            type="number" 
                            placeholder="e.g. 3"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE1D52] transition ${errors.generation ? 'border-red-500' : 'border-slate-300'}`}/>
                            {errors.generation && <span className="text-xs text-red-500">{errors.generation.message}</span>}
                    </div>

                    <div className="pt-4 flex gap-3 justify-end border-t border-slate-50 mt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
                            Cancel
                        </button>
                        
                        <button 
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-[#EE1D52] hover:bg-[#d61c4b] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed">
                            {mutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> {isEditMode ? 'Update Changes' : 'Save Member'}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}