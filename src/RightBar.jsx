import './RightBar.css'

const RightBar = props => {
    const {nameIdRef} = props
    let id 
    let name 
    let description
    if (nameIdRef === 'computer'){
        id = 1
        name="Computer"
        description="A computer is an electronic device that manipulates information, or data. It has the ability to store, retrieve, and process data."
    } 
    else if (nameIdRef === 'server'){
        id = 2
        name="Server"
        description= "A server is a computer or system that provides resources, data, services, or programs to other computers, known as clients, over a network."
    }
    else {
        id = null
        name=null
        description=null
    }
    
    return (
        <div className='right-cont'>
            <form className="form">
                <h1 className='head'>Name</h1>
                <p className='para'>{name}</p>
                <h1 className='head'>ID</h1>
                <p className='para'>{id}</p>
                <h1 className='head'>Description</h1>
                <p className='para'>{description}</p>
            </form>
        </div>
    )
}
export default RightBar