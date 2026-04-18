import deleteIcon from '../../assets/msg_error-1.png'
import { CargoItem } from '../../types/loadPlanPage.types'
import {
  CargoCard,
  CargoRow,
  RestrictionsGrid,
  RestrictionItem,
  DimSeparator,
  NativeSelect,
  CargoInput,
  DeleteButton,
  DeleteIcon
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

type Props = {
  item: CargoItem
  itemsLength: number
  onItemChange: (
    id: string,
    field: keyof Omit<CargoItem, 'id'>
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onCheckboxChange: (
    id: string,
    field:
      | 'mustStayVertical'
      | 'unstackable'
      | 'rotatable'
      | 'tiltAllowed'
      | 'topLoadOnly'
      | 'fragile'
      | 'canBePlacedOnPallet'
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveRow: (id: string) => void
}

const CargoItemRow = ({
  item,
  itemsLength,
  onItemChange,
  onCheckboxChange,
  onRemoveRow
}: Props): React.JSX.Element => {
  const showCartonOptions = item.shape !== 'pallet'

  return (
    <CargoCard>
      <CargoRow>
        <NativeSelect value={item.shape} onChange={onItemChange(item.id, 'shape')}>
          <option value="pallet">Pallet</option>
          <option value="carton">Carton</option>
          <option value="crate">Crate</option>
        </NativeSelect>

        <CargoInput
          type="text"
          value={item.quantity}
          onChange={onItemChange(item.id, 'quantity')}
          placeholder="1"
        />

        <CargoInput
          type="text"
          value={item.length}
          onChange={onItemChange(item.id, 'length')}
          placeholder="L"
        />

        <DimSeparator>x</DimSeparator>

        <CargoInput
          type="text"
          value={item.width}
          onChange={onItemChange(item.id, 'width')}
          placeholder="W"
        />

        <DimSeparator>x</DimSeparator>

        <CargoInput
          type="text"
          value={item.height}
          onChange={onItemChange(item.id, 'height')}
          placeholder="H"
        />

        <NativeSelect value={item.dimensionUnit} onChange={onItemChange(item.id, 'dimensionUnit')}>
          <option value="cm">cm</option>
          <option value="in">in</option>
        </NativeSelect>

        <CargoInput
          type="text"
          value={item.weight}
          onChange={onItemChange(item.id, 'weight')}
          placeholder="0"
        />

        <NativeSelect value={item.weightUnit} onChange={onItemChange(item.id, 'weightUnit')}>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </NativeSelect>

        <DeleteButton
          type="button"
          onClick={() => onRemoveRow(item.id)}
          disabled={itemsLength === 1}
          aria-label="Delete row"
          title="Delete row"
        >
          <DeleteIcon src={deleteIcon} alt="" />
        </DeleteButton>
      </CargoRow>

      <RestrictionsGrid>
        <RestrictionItem>
          <input
            type="checkbox"
            checked={item.mustStayVertical}
            onChange={onCheckboxChange(item.id, 'mustStayVertical')}
          />
          Must stay vertical
        </RestrictionItem>

        <RestrictionItem>
          <input
            type="checkbox"
            checked={item.unstackable}
            onChange={onCheckboxChange(item.id, 'unstackable')}
          />
          Unstackable
        </RestrictionItem>

        <RestrictionItem>
          <input
            type="checkbox"
            checked={item.rotatable}
            onChange={onCheckboxChange(item.id, 'rotatable')}
          />
          Rotatable
        </RestrictionItem>

        <RestrictionItem>
          <input
            type="checkbox"
            checked={item.tiltAllowed}
            onChange={onCheckboxChange(item.id, 'tiltAllowed')}
          />
          Tilt allowed
        </RestrictionItem>

        <RestrictionItem>
          <input
            type="checkbox"
            checked={item.topLoadOnly}
            onChange={onCheckboxChange(item.id, 'topLoadOnly')}
          />
          Top load only
        </RestrictionItem>

        {showCartonOptions && (
          <>
            <RestrictionItem>
              <input
                type="checkbox"
                checked={item.fragile}
                onChange={onCheckboxChange(item.id, 'fragile')}
              />
              Fragile
            </RestrictionItem>

            <RestrictionItem>
              <input
                type="checkbox"
                checked={item.canBePlacedOnPallet}
                onChange={onCheckboxChange(item.id, 'canBePlacedOnPallet')}
              />
              Can be placed on pallet
            </RestrictionItem>
          </>
        )}
      </RestrictionsGrid>
    </CargoCard>
  )
}

export default CargoItemRow
