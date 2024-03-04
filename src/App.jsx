import React from 'react';
import { Stage, Layer, Image, Line, Shape} from 'react-konva'
import useImage from 'use-image';
import RightBar from './RightBar'
import Border from './Border'
import './App.css'

const SIZE = 40

const URLImage = (props) => {
  const {image, id,name, steps, setSteps, nameIdRef} = props
  const [img] = useImage(image.src)
  const [points, setPoints] = React.useState([])
  const key = id
  
  const handleDragMove = (e) => {
    const position = e.target.position()
    setPoints([...points, { x: position.x, y: position.y }])
    let theStep = steps.find(each => each.id === id)
    theStep ={...theStep , ...position, x:position.x, y: position.y}
    const newSteps = steps.map(each => each.id === id ? theStep: each)
    setSteps(newSteps)   
  }

  return (
      <Image
        key={key}
        height={40}
        width={40}
        image={img}
        x={image.x}
        y={image.y}
        strokeWidth={1}
        margin={5}
        stroke="silver"
        draggable 
        onDragMove={handleDragMove}
        onClick={() => nameIdRef.current = name}
        perfectDrawEnabled={false}
      />
  );
};

const LeftBar = (props) => {
  const { dragUrl, nameIdRef } = props;
  const [selectedIcon, setIcon] = React.useState('')

  const handleClick = (event) => {
    setIcon(event.target.id);
  }

  const compPic = 'https://cdn-icons-png.flaticon.com/512/4370/4370714.png'
  const serverPic =
    'https://png.pngtree.com/png-vector/20190811/ourmid/pngtree-vector-server-icon-png-image_1683167.jpg'

  return (
    <div className="left-container">
      <div className="icon-container">
        <img
          draggable="true"
          src={compPic}
          id="computer"
          className={selectedIcon === 'computer' ? 'activeIcon' : 'normalIcon'}
          onClick={handleClick}
          onDragStart={(e) => {
            dragUrl.current = e.target.src
            nameIdRef.current = e.target.id
          }}
        />
        <p className="icon">Computer</p>
      </div>
      <div className="icon-container">
        <img
          src={serverPic}
          id="server"
          className={selectedIcon === 'server' ? 'activeIcon' : 'normalIcon'}
          onClick={handleClick}
          draggable="true"
          onDragStart={(e) => {
            dragUrl.current = e.target.src
            nameIdRef.current = e.target.id
          }}
        />
        <p className="icon">Server</p>
      </div>
    </div>
  );
};

const createConnectionPoints =(source, destination) => {
  return [source.x, source.y, destination.x, destination.y];
}

const hasIntersection = (position, step) => {
  return !(
    step.x > position.x ||
    step.x + SIZE < position.x ||
    step.y > position.y ||
    step.y + SIZE < position.y
  )
}

const detectConnection = (position, id, steps) => {
  const intersectingStep = steps.find((each) => {
    return each.id !== id && hasIntersection(position, each)
  })
  if (intersectingStep) {
    return intersectingStep
  }
  return null;
}


const App = () => {
  const dragUrl = React.useRef()
  const stageRef = React.useRef()
  const nameIdRef = React.useRef()
  const storedSteps = JSON.parse(localStorage.getItem('steps'))
  const storedPreview = JSON.parse(localStorage.getItem('connectionPreview'))
  const storedConnections = JSON.parse(localStorage.getItem('connections'))

  const [steps, setSteps] = React.useState(storedSteps !== null ? storedSteps : [])
  const [connectionPreview, setConnectionPreview] = React.useState(storedPreview!==null ? storedPreview : null)
  const [connections, setConnections] = React.useState(storedConnections!== null ? storedConnections : [])

  React.useEffect(() => {
    localStorage.setItem('steps', JSON.stringify(steps))
    localStorage.setItem('connectionPreview', JSON.stringify(connectionPreview))
    localStorage.setItem('connections', JSON.stringify(connections))
  })

  const handleAnchorDragStart= (e) => {
    const position = e.target.position();
    setConnectionPreview(
      <Line
        x={position.x}
        y={position.y}
        points={createConnectionPoints(position, position)}
        stroke="black"
        strokeWidth={2}
      />
    );
  }

  const getMousePos =(e) => {
    const position = e.target.position();
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    return {
      x: pointerPosition.x - position.x,
      y: pointerPosition.y - position.y
    };
  }

  const handleAnchorDragMove = (e) => {
    const position = e.target.position();
    const mousePos = getMousePos(e);
    setConnectionPreview(
      <Line
        x={position.x}
        y={position.y}
        points={createConnectionPoints({ x: 0, y: 0 }, mousePos)}
        stroke="black"
        strokeWidth={2}
      />
    );
  }

  const handleAnchorDragEnd =(e, id) => {
    setConnectionPreview(null);
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
    const connectionTo = detectConnection(mousePos, id, steps)
    if (connectionTo !== null) {
      setConnections([
        ...connections,
        {
          to: connectionTo.id,
          from: id
        }
      ])
    }
  }

  const connectionObjs = connections.map((each) => {
    const fromStep = steps.find(step => step.id === each.from);
    const toStep = steps.find(step => step.id === each.to);
    const p1 = { x: (fromStep.x + toStep.x) / 2, y: fromStep.y };
    const p2 = { x: (fromStep.x + toStep.x) / 2, y: toStep.y };
    
    return (
      <Shape 
        key= {each.to}
        sceneFunc={(context, shape) => {
          context.beginPath()
          context.moveTo(fromStep.x + SIZE/2, fromStep.y + SIZE/2)
          context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, toStep.x + SIZE/2, toStep.y + SIZE/2)
          context.fillStrokeShape(shape)
        }}
        stroke="gold"
        strokeWidth={3}
      />
    )
  })

  const borders =
    steps.map( each =>
      <Border
        id={each.id} step={each}
        onAnchorDragEnd={(e) => handleAnchorDragEnd(e, each.id)}
        onAnchorDragMove={handleAnchorDragMove}
        onAnchorDragStart={handleAnchorDragStart}
        key={each.id}
      />
    )

  return (
    <div className="div-container">
      <LeftBar dragUrl={dragUrl} nameIdRef={nameIdRef} />
      <div
        onDrop={(e) => {
          e.preventDefault();
          stageRef.current.setPointersPositions(e);
          setSteps(
            steps.concat([
              { id:steps.length+1, ...stageRef.current.getPointerPosition(),
                name:nameIdRef.current, src: dragUrl.current, 
                x:stageRef.current.getPointerPosition().x, y:stageRef.current.getPointerPosition().y }
            ])
          );
        }}
        onDragOver={(e) => e.preventDefault()}
        className="panel-div"
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ border: '1px solid grey' }}
          ref={stageRef}
        >
          <Layer>
            {steps.map((each) => <URLImage image={each} id={each.id} name={each.name}
                                            steps={steps} setSteps={setSteps}
                                            nameIdRef={nameIdRef}
                                            key={each.id}/>)}
            {borders}
            {connectionObjs}
            {connectionPreview}
          </Layer>
        </Stage>
      </div>
      <RightBar nameIdRef={nameIdRef.current} />
    </div>
  )
}

export default App
