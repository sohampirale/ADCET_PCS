"use client"
type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};


export function Modal({ isOpen, onClose, children }: ModalProps) {
    if(!isOpen)return null;
    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={onClose}
            >   
                <div
                    className="bg-white rounded-xl p-6 shadow-xl min-w-[300px]"
                    onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
                >
                    {children}
                </div>
            </div>
        </>
    )
}